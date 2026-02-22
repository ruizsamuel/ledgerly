// toast-container.component.ts
import { Component, inject } from '@angular/core';
import { ToastService } from '../../../shared/common/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  toastService = inject(ToastService);
}

