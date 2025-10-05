// toast.service.ts
import { computed, Injectable, signal } from '@angular/core';
import { Toast } from '../../core/types/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  toasts = computed(() => this._toasts());

  private idCounter = 0;

  show(message: string, type: Toast['type'] = 'info', duration = 5000) {
    const toast: Toast = { id: ++this.idCounter, message, type, duration };
    this._toasts.update(list => [...list, toast]);

    setTimeout(() => this.dismiss(toast.id), duration);
  }

  dismiss(id: number) {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}

