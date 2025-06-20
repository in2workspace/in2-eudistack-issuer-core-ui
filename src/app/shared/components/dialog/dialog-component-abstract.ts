import { Observable } from 'rxjs';
import { BaseDialogData, LoadingData } from './dialog-data';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export abstract class BaseDialogComponent<D extends BaseDialogData> {
  constructor(@Inject(MAT_DIALOG_DATA) public data: D) {}

  abstract updateData(loadingData: LoadingData): void | any;
  abstract afterConfirm$(): Observable<boolean>;
  abstract getEmbeddedInstance<T>(): T | null;
}