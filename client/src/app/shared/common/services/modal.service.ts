import { Injectable, signal } from '@angular/core';
import { ModalConfig } from '../../../core/models/modal.model';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private _modal = signal<ModalConfig | null>(null);

  modal = this._modal.asReadonly();

  open(config: ModalConfig) {
    this._modal.set(config);
  }

  close() {
    this._modal.set(null);
  }
}

