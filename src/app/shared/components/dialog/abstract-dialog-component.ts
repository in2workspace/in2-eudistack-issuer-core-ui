// abstract-dialog.component.ts
import { inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { BaseDialogData, DialogStatus } from './dialog-data';

export abstract class AbstractDialogComponent<T extends BaseDialogData> {
  public data = inject(MAT_DIALOG_DATA) as T;
  public statusColor: 'primary' | 'warn' = 'primary';
  public currentStatus?: DialogStatus;
  protected readonly dialogRef = inject<MatDialogRef<T>>(MatDialogRef);
  protected readonly confirmSubject$ = new Subject<boolean>();

  public constructor() {
    const style = this.data.style ?? this.getDefaultStyle();
    this.dialogRef.addPanelClass(style);
    this.updateStatus();
  }

  public updateStatus(): void {
    const prev = this.currentStatus;
    this.currentStatus = this.data.status;
    this.updateStatusPanelClass(prev);
    this.updateStatusColor();
  }

  public updateData(patch: Partial<T>): void {
    const resetDefaultOptionalData = {
      confirmationLabel: undefined,
      cancelLabel: undefined,
      loadingData: undefined
    } as Partial<T>;

    this.data = {
      ...this.data,
      ...resetDefaultOptionalData,
      ...patch,
    };
    this.updateStatus();
  }

  public afterConfirm$(): Observable<boolean> {
    return this.confirmSubject$.asObservable();
  }


  public onConfirm(): void {
    switch (this.data.confirmationType) {
      case 'none':
        this.onCancel();
        break;
      case 'sync':
        this.confirmSubject$.next(true);
        this.dialogRef.close(true);
        break;
      case 'async':
        this.confirmSubject$.next(true);
        break;
    }
  }

  public onCancel(): void {
    this.dialogRef.close(false);
  }

  public getEmbeddedInstance<I>(): I | null {
    return null;
  }


  protected getDefaultStyle(): string {
    return 'dialog-custom';
  }


  protected updateStatusColor(): void {
    this.statusColor = this.currentStatus === 'error' ? 'warn' : 'primary';
  }

  protected updateStatusPanelClass(previous: DialogStatus | undefined): void {
    if (previous !== this.currentStatus) {
      this.dialogRef.removePanelClass(`dialog-${previous}`);
      this.dialogRef.addPanelClass(`dialog-${this.currentStatus}`);
    }
  }
}
