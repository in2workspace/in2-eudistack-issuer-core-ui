import { Component, ComponentRef, inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subject } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CdkPortalOutlet, ComponentPortal, DomPortal, PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { MatIconModule } from '@angular/material/icon';

export type DialogStatus = 'default' | 'error';
export type DialogConfirmationType = 'none' | 'sync' | 'async';
export interface LoadingData { title:string, message:string; template?:ComponentPortal<any>|TemplatePortal|DomPortal }
export interface DialogData { 
  title: string; 
  message: string; 
  status: DialogStatus;
  confirmationType: DialogConfirmationType;
  template?: ComponentPortal<any>|TemplatePortal|DomPortal;
  loadingData?: LoadingData;
  confirmationLabel?: string;
  cancelLabel?: string;
  style?: string;
  fullCustomTemplate?: ComponentPortal<any>|TemplatePortal|DomPortal;
}
export interface DialogDefaultContent {
  data: DialogData;
}

//Confirmation type:none - no confirmation needed, so only one button is displayed, which closes the dialog
//
@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    //for styles, look _dialogscss in global styles
    standalone: true,
    imports: [
        AsyncPipe,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatIconModule,
        NgClass,
        PortalModule,
        MatProgressSpinnerModule,
        TranslatePipe,
    ],
})
export class DialogComponent implements AfterViewInit {
  //todo
  @ViewChild('fullCustom', {read: CdkPortalOutlet}) fullCustomOutlet: CdkPortalOutlet|undefined;
  public data = inject<DialogData>(MAT_DIALOG_DATA);
  public readonly dialogRef = inject(MatDialogRef<DialogComponent>);
  private readonly loader = inject(LoaderService);
  
  public isLoading$ = this.loader.isLoading$;
  public statusColor = 'primary';
  public currentStatus: DialogStatus | undefined = undefined;

  private readonly confirmSubj$ = new Subject<true>();

  public constructor(){
    if(this.data?.style){
      this.dialogRef.addPanelClass(this.data.style);
    }
    else{
      this.dialogRef.addPanelClass('dialog-custom');
    }
    this.updateStatus();
  }
  ngAfterViewInit(){
    //todo

  }
  public updateStatus(): void{
    const previousStatus = this.currentStatus;
    this.currentStatus = this.data.status;
    this.updateStatusPanelClass(previousStatus);
    this.updateStatusColor();
  }
  
  //ideally this should be done with reactive state management
  public updateStatusColor(): void{
    this.statusColor = this.currentStatus === 'error' ? 'warn' : 'primary';
  }

  public updateStatusPanelClass(previousStatus: DialogStatus | undefined): void{
    if(previousStatus !== this.currentStatus){
      this.dialogRef.removePanelClass(`dialog-${previousStatus}`);
      this.dialogRef.addPanelClass(`dialog-${this.currentStatus}`);
    }
  }

  public updateData(data: Partial<DialogData>){
    const resetDefaultOptionalData:Partial<DialogData> = {
      template: undefined,
      confirmationLabel: undefined,
      cancelLabel: undefined
    }
    
    this.data = { 
      ...this.data, 
      ...resetDefaultOptionalData,
      ...data };
    this.updateStatus();
  }

  // this is used by the dialog wrapper service, which subscribes to this subject to call the callback after the this emits 
  public afterConfirm$(): Observable<boolean>{
    return this.confirmSubj$.asObservable();
  }

  public onConfirm(){
    if(this.data.confirmationType === 'none'){
      this.onCancel();
    }
    else if(this.data.confirmationType === 'sync'){
      this.confirmAndClose();
    }
    else if(this.data.confirmationType === 'async'){
      this.confirmWithoutClosing();
    }
  }

  @ViewChild(CdkPortalOutlet) portalOutlet!: CdkPortalOutlet;

  getEmbeddedInstance<T>(): T | null {
    const attachedRef = this.portalOutlet?.attachedRef;
    if (attachedRef && 'instance' in attachedRef) {
      return (attachedRef as ComponentRef<T>).instance;
    }
    return null;
  }

  public confirmWithoutClosing(){
    this.confirmSubj$.next(true);
  }

  public confirmAndClose(): void {
    this.dialogRef.close(true);
  }

  public onCancel(): void {
    this.dialogRef.close(false);
  }

  

}
