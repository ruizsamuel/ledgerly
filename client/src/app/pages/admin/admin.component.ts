import { Component, inject, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { firstValueFrom } from "rxjs";
import { FormComponent } from "../../shared/ui/components/form/form.component";
import { SettingsHelper } from "../../shared/ui/helpers/settings.helper";
import { SettingsService } from "../../shared/service/settings.service";
import { LoadingComponent } from "../../shared/ui/components/loading/loading.component";
import { Settings } from "../../shared/domain/models/settings.model";
import { ToastService } from "../../shared/service/toast.service";
import { UserService } from "../../shared/service/user.service";
import { UserHelper } from "../../shared/ui/helpers/user.helper";
import { PaginationService } from "../../shared/service/pagination.service";
import { TableComponent } from "../../shared/ui/components/table/table.component";
import { PaginationComponent } from "../../shared/ui/components/pagination/pagination.component";
import { User } from "../../shared/domain/models/user.model";
import { ModalService } from "../../shared/service/modal.service";
import { ConfirmationComponent } from "../../shared/ui/components/confirmation/confirmation.component";
import { NewUserDTO, UpdateUserDTO } from "../../shared/domain/dto/user.dto";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [FormComponent, LoadingComponent, TableComponent, PaginationComponent]
})
export class AdminComponent {

  settingsService = inject(SettingsService);
  settingsHelper = SettingsHelper;

  userService = inject(UserService);
  userHelper = UserHelper;

  toastService = inject(ToastService);

  paginationService = inject(PaginationService);
  modalService = inject(ModalService);

  settingsFormTitle = signal($localize`:{@@settingsTitle}:Application Settings`);

  searchTerm = signal('');

  sortBy = signal<'date' | 'amount'>('date');
  sortDirection = signal<'asc' | 'desc'>('desc');

  settingsResource = rxResource({
    params: () => ({}),
    stream: () => { return this.settingsService.getSettings() }
  });

  userResource = rxResource({
    params: () => ({
      page: this.paginationService.currentPage(),
      searchTerm: this.searchTerm(),
      sortBy: this.sortBy(),
      sort: this.sortDirection(),
    }),
    stream: ( request ) => { return this.userService.getAll(request.params) }
  });

  settingsSubmit(settings: Settings) {
    firstValueFrom(this.settingsService.updateSettings(settings))
      .then((res) => { this.toastService.show(res.message , 'success'); this.settingsResource.reload(); })
  }

  handleUserDeleteSelection(users: User[]) {
    this.modalService.open({
      component: ConfirmationComponent,
      inputs: {
        message: $localize`:{@@deleteSelectedUsersConfirmation}:Are you sure you want to delete the selected users?. This action cannot be undone.`,
        submitButtonText: $localize`:{@@deleteButton}:Delete`
      },
      outputs: {
        onResult: async (result: boolean) => {
          this.modalService.close();
          if (result) {
            Promise.all(users.map(entity => firstValueFrom(this.userService.deleteEntity(entity.id!))))
              .then(() => {
                this.toastService.show($localize`:{@@selectionDeleted}:Selected items have been deleted`, 'success');
                this.userResource.reload();
              })
              .catch(() => {}
            );
          }
          this.modalService.close();
        }
      }
    });
  }

  handleUserDelete(user: User) {
    this.modalService.open({
      component: ConfirmationComponent,
      inputs: {
        message: $localize`:{@@deleteSelectedUserConfirmation}:Are you sure you want to delete the user: ${user.name}. This action cannot be undone.`,
        submitButtonText: $localize`:{@@deleteButton}:Delete`
      },
      outputs: {
        onResult: async (result: boolean) => {
          this.modalService.close();
          if (result) {
            firstValueFrom(this.userService.deleteEntity(user.id!))
              .then((res) => {
                this.toastService.show(res.message, 'success');
                this.userResource.reload();
              })
              .catch(() => {}
            );
          }
          this.modalService.close();
        }
      }
    });
  }

  showUserForm(user: User | null) {
    this.modalService.open({
      component: FormComponent,
      inputs: {
        title: user ? $localize`:{@@editUserTitle}:Edit User` : $localize`:{@@createUserTitle}:Create User`,
        fields: this.userHelper.createEditForm(user),
        submitButtonText: user ? $localize`:{@@updateButton}:Update` : $localize`:{@@createButton}:Create`
      },
      outputs: {
        formSubmit: async (data: UpdateUserDTO | NewUserDTO) => {
          if (user) {
            await firstValueFrom(this.userService.updateEntity(user.id!, data as UpdateUserDTO))
              .then(response => {
                this.toastService.show(response.message, 'success');
                this.userResource.reload();
              })
              .catch(() => {})
          } else {
            await firstValueFrom(this.userService.createEntity(data as NewUserDTO))
              .then(response => {
                this.toastService.show(response.message, 'success');
                this.userResource.reload();
              })
              .catch(() => {})
          }
          this.modalService.close();
        },
        formCancel: () => this.modalService.close()
      }
    });
  }
}
