import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-machine-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './machine-confirm-dialog.component.html',
  styleUrl: './machine-confirm-dialog.component.scss'
})
export class MachineConfirmDialogComponent {
  @Output() confirmEmit = new EventEmitter();
confirm(){
  this.confirmEmit.emit();
}
}
