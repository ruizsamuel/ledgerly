import { Component, effect, input, output, signal } from "@angular/core";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {
  placeholder = input($localize`:{@@searchPlaceholder}:Search...`);
  debounceTime = input(500);

  onSearch = output<string>();

  protected term = signal('');

  debounceEffect = effect((onCleanup) => {
    const t = this.term();

    const timeout = setTimeout(() => {
      this.onSearch.emit(t);
    }, 500);

    onCleanup(() => clearTimeout(timeout));
  });
}
