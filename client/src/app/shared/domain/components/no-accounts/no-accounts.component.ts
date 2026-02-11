import { Component, inject } from "@angular/core";
import { ModalService } from "../../../service/modal.service";
import { FormComponent } from "../../../ui/components/form/form.component";
import { Account } from "../../../domain/models/account.model";
import { AccountHelper } from "../../../ui/helpers/account.helper";
import { AccountService } from "../../../service/account.service";
import { firstValueFrom } from "rxjs";
import { ToastService } from "../../../service/toast.service";

@Component({
  selector: 'app-no-accounts',
  templateUrl: './no-accounts.component.html',
})
export class NoAccountsComponent {

  private modalService = inject(ModalService);
  private accountService = inject(AccountService);
  private toastService = inject(ToastService);
  private accountHelper = AccountHelper;

  handleCreateAccount() {
    this.modalService.close();
    this.modalService.open({
      component: FormComponent<Account>,
      inputs: {
        title: $localize`:{@@createAccountTitle}:Create Account`,
        fields: this.accountHelper.createEditForm(null),
        submitButtonText: $localize`:{@@createButton}:Create`
      },
      outputs: {
        formSubmit: (data: Account) => {
          firstValueFrom(this.accountService.createEntity(data)).then((res) => {
            this.toastService.show(res.message || $localize`:{@@accountCreated}:Account created successfully`, 'success');
            this.modalService.close();
            window.location.reload();
          });
        },
        formCancel: () => {
          this.modalService.close();
        }
      }
    });
  }
}
