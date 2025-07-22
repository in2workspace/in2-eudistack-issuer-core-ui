import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ConditionalConfirmDialogData } from '../dialog-data';
import { TranslatePipe } from '@ngx-translate/core';
import { AbstractDialogComponent } from '../abstract-dialog-component';

@Component({
  selector: 'app-conditional-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCheckboxModule, MatDialogTitle,
          MatDialogContent,
          MatDialogActions, TranslatePipe],
  templateUrl: './conditional-confirm-dialog.component.html',
  styleUrl: './conditional-confirm-dialog.component.scss',
})
export class ConditionalConfirmDialogComponent extends AbstractDialogComponent<ConditionalConfirmDialogData> {

  public checkboxChecked = signal<boolean>(false);

  public override onConfirm(): void {
    if (this.checkboxChecked()) {
      super.onConfirm();
    }
  }

  public toggleCheckbox(checked: boolean): void {
    this.checkboxChecked.set(checked);
  }
  
  protected override getDefaultStyle(): string {
    return 'conditional-confirm';
  }

}
