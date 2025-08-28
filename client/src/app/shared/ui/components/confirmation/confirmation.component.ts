import { Component, input, output } from "@angular/core";

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
})
export class ConfirmationComponent {
  message = input($localize`:{@@defaultConfirmationMessage}:Are you sure you want to proceed?`);
  onResult = output<boolean>();
}
