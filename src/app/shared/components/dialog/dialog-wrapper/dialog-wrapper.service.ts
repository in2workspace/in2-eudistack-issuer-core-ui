import { DestroyRef, inject, Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BaseDialogComponent } from './../dialog-component-abstract';
import { EMPTY, filter, Observable, switchMap, take, tap } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DialogData } from '../dialog-data';

export type observableCallback = () => Observable<any>;

@Injectable({
  providedIn: 'root'
})
export class DialogWrapperService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly loader = inject(LoaderService);

  public openDialog<T extends BaseDialogComponent>(
    component: Type<T>,
    dialogData: DialogData
  ): MatDialogRef<T, any> {
    return this.dialog.open(component, {
      data: { ...dialogData },
      autoFocus: false
    });
  }

  public openErrorInfoDialog<T extends BaseDialogComponent>(
    component: Type<T>,
    message: string,
    title?: string
  ): MatDialogRef<T, any> {
    const errorDialogData: DialogData = {
      title: title ?? 'Error',
      message,
      confirmationType: 'none',
      status: 'error'
    };
    const openDialog = this.dialog.openDialogs.find(
      dialog => dialog.componentInstance instanceof component
    ) as MatDialogRef<T, any> | undefined;

    if (openDialog) {
      openDialog.componentInstance.updateData(errorDialogData);
      return openDialog;
    } else {
      return this.dialog.open(component, {
        data: { ...errorDialogData }
      });
    }
  }

  public openDialogWithCallback<T extends BaseDialogComponent>(
    component: Type<T>,
    dialogData: DialogData,
    callback: observableCallback,
    cancelCallback?: () => Observable<any>,
    disableClose?: 'DISABLE_CLOSE'
  ): MatDialogRef<T, any> {
    const dialogRef = this.dialog.open(component, {
      data: { ...dialogData },
      autoFocus: false,
      disableClose: disableClose === 'DISABLE_CLOSE'
    });

    let confirm$: Observable<boolean>;

    if (dialogData.confirmationType === 'sync') {
      confirm$ = dialogRef.afterClosed();
    } else if (dialogData.confirmationType === 'async') {
      confirm$ = dialogRef.componentInstance.afterConfirm$().pipe(
        tap(() => {
          if (dialogData.loadingData) {
            dialogRef.componentInstance.updateData(dialogData.loadingData);
          }
          dialogRef.disableClose = true;
          this.loader.updateIsLoading(true);
        })
      );
    } else {
      return dialogRef;
    }

    confirm$
      .pipe(
        take(1),
        switchMap(confirmed => this.executeCallbackOnCondition(callback, confirmed))
      )
      .subscribe({
        next: () => dialogRef.close(),
        error: err => console.error(err),
        complete: () => dialogRef.close()
      }).add(() => {
        dialogRef.disableClose = false;
        this.loader.updateIsLoading(false);
      });

    if (cancelCallback) {
      dialogRef.afterClosed()
        .pipe(take(1), filter(val => val === false), switchMap(cancelCallback))
        .subscribe();
    }

    return dialogRef;
  }

  public openDialogWithForm<T extends BaseDialogComponent, TFormValue>(
    component: Type<T>,
    dialogData: DialogData,
    validateForm: (formInstance: any) => boolean,
    getFormValue: (formInstance: any) => TFormValue,
    asyncOperation: (formValue: TFormValue) => Observable<any>
  ): MatDialogRef<T, any> {
    const dialogRef = this.dialog.open(component, {
      data: { ...dialogData },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.componentInstance.afterConfirm$().subscribe(() => {
      const formInstance = dialogRef.componentInstance.getEmbeddedInstance<any>();
      if (!formInstance) return;

      if (!validateForm(formInstance)) {
        if (typeof formInstance.markTouched === 'function') {
          formInstance.markTouched();
        }
        return;
      }

      this.loader.updateIsLoading(true);
      const formValue = getFormValue(formInstance);

      asyncOperation(formValue).subscribe({
        next: res => {
          if (res?.noChanges) {
            console.info('No changes to update.');
          }
          dialogRef.close();
          this.loader.updateIsLoading(false);
        },
        error: err => {
          console.error('Error executing asyncOperation', err);
          this.loader.updateIsLoading(false);
        }
      });
    });

    return dialogRef;
  }

  private executeCallbackOnCondition(
    callback: observableCallback,
    condition: boolean
  ): Observable<any> {
    return condition ? callback() : EMPTY;
  }
}
