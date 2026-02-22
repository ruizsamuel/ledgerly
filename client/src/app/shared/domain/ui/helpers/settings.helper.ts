import { Settings } from "../../models/settings.model";
import { FormConfig } from "../../../common/ui/models/form-config.model";

export class SettingsHelper {

  static form(settings: Settings): FormConfig {
    return [
      {
        key: 'allowUserRegistration',
        label: $localize`:@@allowUserRegistrationFieldLabel:Allow User Registration`,
        type: 'checkbox',
        value: settings.allowUserRegistration
      }
    ];
  }
}
