import { ComponentPortal, TemplatePortal, DomPortal } from "@angular/cdk/portal";

export type DialogStatus = 'default' | 'error';
export type DialogConfirmationType = 'none' | 'sync' | 'async';
export interface LoadingData { title:string, message:string; template?:ComponentPortal<any>|TemplatePortal|DomPortal }

export interface DialogData{ 
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