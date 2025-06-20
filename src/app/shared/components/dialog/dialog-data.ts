import { ComponentPortal, TemplatePortal, DomPortal } from "@angular/cdk/portal";

export type DialogStatus = 'default' | 'error';
export type DialogConfirmationType = 'none' | 'sync' | 'async';
export interface LoadingData { title:string, message:string; template?:ComponentPortal<any>|TemplatePortal|DomPortal }
export interface DialogDefaultContent {
  data: DialogData;
}
export interface BaseDialogData{
  title: string; 
  message: string; 
  status: DialogStatus;
  confirmationType: DialogConfirmationType;
  loadingData?: LoadingData;
  confirmationLabel?: string;
  cancelLabel?: string;
  style?: string;
}

export interface DialogData extends BaseDialogData{ 
  template?: ComponentPortal<any>|TemplatePortal|DomPortal;
  confirmationLabel?: string;
  cancelLabel?: string;
  style?: string;
}

export interface ConditionalConfirmDialogData extends BaseDialogData{
  checkboxLabel: string;
  belowText?: string;
}
