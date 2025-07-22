// abstract-dialog.component.ts
import { inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { BaseDialogData, DialogStatus } from './dialog-data';

export abstract class AbstractDialogComponent<T extends BaseDialogData> {
  // ─── CAMPS ─────────────────────────────────────────────────────
  public data = inject(MAT_DIALOG_DATA) as T;
  public statusColor: 'primary' | 'warn' = 'primary';
  public currentStatus?: DialogStatus;
  protected readonly dialogRef = inject<MatDialogRef<T>>(MatDialogRef);
  protected readonly confirmSubject$ = new Subject<boolean>();

  // ─── CONSTRUCTOR ──────────────────────────────────────────────
  public constructor() {
    const style = this.data.style ?? this.getDefaultStyle();
    this.dialogRef.addPanelClass(style);
    this.updateStatus();
  }

  // ─── MÈTODES PÚBLICS ──────────────────────────────────────────
  /** Recalcula status, classes i colors */
  public updateStatus(): void {
    const prev = this.currentStatus;
    this.currentStatus = this.data.status;
    this.updateStatusPanelClass(prev);
    this.updateStatusColor();
  }

  /** Permet fer un patch de data i refrescar l’estat */
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

  /** Observable que emet quan confirmes */
  public afterConfirm$(): Observable<boolean> {
    return this.confirmSubject$.asObservable();
  }

  /** Confirma (+tanca) */
  public onConfirm(): void {
    this.confirmSubject$.next(true);
    this.dialogRef.close(true);
  }

  /** Cancel·la (tanca amb false) */
  public onCancel(): void {
    this.dialogRef.close(false);
  }

  /** Per als portals embeguts, override si cal */
  public getEmbeddedInstance<I>(): I | null {
    return null;
  }

  // ─── MÈTODES PROTECTED ────────────────────────────────────────
  /** Estil per defecte si no hi ha data.style */
  protected getDefaultStyle(): string {
    return 'dialog-custom';
  }

  /** Canvia el color segons status */
  protected updateStatusColor(): void {
    this.statusColor = this.currentStatus === 'error' ? 'warn' : 'primary';
  }

  /** Gestiona les classes del panel segons status */
  protected updateStatusPanelClass(previous: DialogStatus | undefined): void {
    if (previous !== this.currentStatus) {
      this.dialogRef.removePanelClass(`dialog-${previous}`);
      this.dialogRef.addPanelClass(`dialog-${this.currentStatus}`);
    }
  }
}
