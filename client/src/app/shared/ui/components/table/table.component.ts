import { Component, input, output, signal } from '@angular/core';
import { TableConfig } from '../../types/table-config.model';
import { AvatarPipe } from "../../pipes/avatar.pipe";

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  imports: [AvatarPipe],
})
export class TableComponent<T extends Record<string, any>> {
  data = input.required<T[]>();
  config = input.required<TableConfig<T>>();
  selectable = input<boolean>(true);

  protected selection = signal<T[]>([]);
  protected openId = signal<number | null>(null);

  onEdit = output<T>();
  onDelete = output<T>();
  onDeleteSelection = output<T[]>();

  onCheckboxChange(item: T) {
    const current = this.selection();
    if (!this.selection().includes(item)) {
      this.selection.set([...current, item]);
    } else {
      this.selection.set(current.filter(i => i !== item));
    }
  }

  toggleSelectAll() {
    if (this.selection().length === this.data().length) {
      this.selection.set([]);
    } else {
      this.selection.set([...this.data()]);
    }
  }
}

