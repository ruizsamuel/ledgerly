import { Component, effect, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalService } from '../../../shared/service/modal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  modalService = inject(ModalService);
  @ViewChild('vc', { read: ViewContainerRef }) vcr!: ViewContainerRef;

  constructor() {
    effect((onCleanup) => {
      const modal = this.modalService.modal();
      if (!modal) return;

      this.vcr.clear();

      const compRef = this.vcr.createComponent(modal.component);

      // asignar inputs correctamente si son signals
      if (modal.inputs) {
        for (const [key, value] of Object.entries(modal.inputs)) {
          compRef.setInput(key, value);
        }
      }

      const subs: any[] = [];
      if (modal.outputs) {
        for (const [key, handler] of Object.entries(modal.outputs)) {
          const emitter = (compRef.instance as any)[key];
          if (emitter?.subscribe) {
            subs.push(emitter.subscribe(handler));
          }
        }
      }

      compRef.changeDetectorRef.detectChanges();

      onCleanup(() => {
        subs.forEach(s => s.unsubscribe?.());
        compRef.destroy();
      });
    });
  }
}
