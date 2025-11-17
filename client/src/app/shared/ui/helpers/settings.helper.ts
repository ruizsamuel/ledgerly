import { Settings } from "../../domain/models/settings.model";
import { FormConfig } from "../types/form-config.model";

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
