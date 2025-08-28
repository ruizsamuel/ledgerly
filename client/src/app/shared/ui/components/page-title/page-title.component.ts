import { Component, input } from "@angular/core";

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
})
export class PageTitleComponent {
  title = input.required<string>();
  description = input.required<string>();
}
