import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Observable, Subject } from 'rxjs';
import { BaseDialogComponent } from '../dialog-component-abstract';
import { DialogStatus, DialogData } from '../dialog-data';

// todo fer germà de DialogComponent
export interface ConditionalConfirmDialogData {
  title: string;
  message: string;
  checkboxLabel: string;
  belowText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  style?: string;
  status: DialogStatus;
  confirmationType: 'sync' | 'async' | 'none';
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
  
  public statusColor = 'primary';
  public currentStatus: DialogStatus | undefined = undefined;

  public checkboxChecked = signal(false);
  private confirm$ = new Subject<boolean>();

  public constructor(){
      if(this.data?.style){
        this.dialogRef.addPanelClass(this.data.style);
      }
      else{
        this.dialogRef.addPanelClass('dialog-custom');
      }
      this.updateStatus();
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
