// dialog.component.ts
import { Component, ComponentRef, ViewChild, inject } from '@angular/core';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from 'src/app/core/services/loader.service';
import {
  CdkPortalOutlet, PortalModule
} from '@angular/cdk/portal';
import { MatIconModule } from '@angular/material/icon';
import { DialogData } from '../dialog-data';
import { AbstractDialogComponent } from '../abstract-dialog-component';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
    MatProgressSpinnerModule,
    NgClass,
    PortalModule,
    TranslatePipe,
  ],
  templateUrl: './dialog.component.html',
})
export class DialogComponent extends AbstractDialogComponent<DialogData> {
  @ViewChild(CdkPortalOutlet) public portalOutlet!: CdkPortalOutlet;
  public isLoading$ = inject(LoaderService).isLoading$;

    public override updateData(patch: Partial<DialogData>): void{
      const reset:Partial<DialogData> = {
        template: undefined,
        confirmationLabel: undefined,
        cancelLabel: undefined
      }
      
      super.updateData({ ...reset, ...patch });
    }

  public override onConfirm(): void {
    switch (this.data.confirmationType) {
      case 'none':
        this.onCancel();
        break;
      case 'sync':
        super.onConfirm();
        break;
      case 'async':
        this.confirmSubject$.next(true);
        break;
    }
  }

  public override getEmbeddedInstance<T>(): T | null {
    const attached = this.portalOutlet?.attachedRef;
    if (attached && 'instance' in attached) {
      return (attached as ComponentRef<T>).instance;
    }
    return null;
  }
}
