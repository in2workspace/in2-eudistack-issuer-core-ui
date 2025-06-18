import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Observable, Subject } from 'rxjs';
import { BaseDialogComponent } from '../dialog-component-abstract';

export interface ConditionalConfirmDialogData {
  title: string;
  message: string;
  checkboxLabel: string;
  belowText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-conditional-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatButtonModule],
  templateUrl: './conditional-confirm-dialog.component.html',
  styleUrl: './conditional-confirm-dialog.component.scss',
})
export class ConditionalConfirmDialogComponent implements BaseDialogComponent {
  public readonly dialogRef = inject(MatDialogRef<ConditionalConfirmDialogComponent>);
  public data = inject<ConditionalConfirmDialogData>(MAT_DIALOG_DATA);

  public checkboxChecked = signal(false);
  private confirm$ = new Subject<boolean>();

  updateData(data: ConditionalConfirmDialogData): void {
    this.data = data;
  }

  afterConfirm$(): Observable<boolean> {
    return this.confirm$.asObservable();
  }

  getEmbeddedInstance<T>(): T | null {
    return null;
  }

  onConfirm(): void {
    this.confirm$.next(true);
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  toggleCheckbox(checked: boolean) {
    this.checkboxChecked.set(checked);
  }
}
