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

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [FormComponent, LoadingComponent]
})
export class AdminComponent {

  settingsService = inject(SettingsService);
  settingsHelper = SettingsHelper;

  userService = inject(UserService);
  userHelper = UserHelper;

  toastService = inject(ToastService);

  formTitle = signal($localize`:{@@settingsTitle}:Application Settings`);

  settingsResource = rxResource({
    params: () => ({}),
    stream: () => { return this.settingsService.getSettings() }
  });

  // TODO: Paginacion, filter, etc
  /*userResource = rxResource({
    params: () => ({}),
    stream: () => { return this.userService.getAll() }
  });*/

  settingsSubmit(settings: Settings) {
    firstValueFrom(this.settingsService.updateSettings(settings))
      .then((res) => { this.toastService.show(res.message , 'success'); this.settingsResource.reload(); })
  }
}
