import { Component, computed, input } from "@angular/core";

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
})
export class LogoComponent {
  size = input<'small' | 'medium' | 'large' | 'extralarge'>('small');

  sizeClass = computed(() => {
    const sizes = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-2xl',
      extralarge: 'text-5xl'
    }

    return sizes[this.size()];
  })
}
