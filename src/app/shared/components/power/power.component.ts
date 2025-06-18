import { FormCredentialService } from '../form-credential/services/form-credential.service';
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { AuthService } from "../../../core/services/auth.service";
import { MatSelectChange, MatSelect, MatSelectTrigger } from '@angular/material/select';
import { EMPTY, Observable } from 'rxjs';
import { TempPower } from 'src/app/core/models/temp/temp-power.interface';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { DialogWrapperService } from '../dialog/dialog-wrapper/dialog-wrapper.service';
import { TmfFunction } from 'src/app/core/models/entity/lear-credential';
import { DialogComponent, DialogData } from '../dialog/dialog-component/dialog.component';

@Component({
    selector: 'app-power',
    templateUrl: './power.component.html',
    styleUrls: ['./power.component.scss'],
    standalone: true,
    imports: [NgIf, MatFormField, MatSelect, MatSelectTrigger, MatOption, MatButton, NgFor, NgTemplateOutlet, MatSlideToggle, FormsModule, MatMiniFabButton, MatIcon, AsyncPipe, TranslatePipe]
})
export class PowerComponent implements OnInit{
  // set-once-and-don't-change properties@Input() public power: TempPower[] = [];
  public organizationIdentifierIsIn2: boolean = false;

  //streams (form states)
  public addedPowers$: Observable<TempPower[]>;
  public selectedPower$: Observable<string>;

  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(DialogWrapperService);
  private readonly formService = inject(FormCredentialService);
  private readonly translate = inject(TranslateService);


  public constructor(){
    this.addedPowers$ = this.formService.getAddedPowers();
    this.selectedPower$ = this.formService.getSelectedPowerName();
  }

  public ngOnInit(){
    this.organizationIdentifierIsIn2 = this.authService.hasIn2OrganizationIdentifier();
  }

  public addPower(): void {
    const selectedPower = this.formService.getPlainSelectedPower() as TmfFunction;

    if(this.isOptionDisabled(selectedPower)) return;

    if (selectedPower === 'Onboarding' && !this.organizationIdentifierIsIn2) {
      return;
    }

    if (selectedPower === 'Certification' && !this.organizationIdentifierIsIn2) {
      return;
    }

    const newPower: TempPower = {
      action: '',
      domain: 'DOME',
      function: selectedPower,
      type: 'Domain',
      execute: false,
      create: false,
      update: false,
      delete: false,
      upload: false,
      attest: false
    };

    switch(selectedPower) {
      case 'Certification':
        newPower.upload = false;
        newPower.attest = false;
        break;
      case 'ProductOffering':
        newPower.create = false;
        newPower.update = false;
        newPower.delete = false;
        break;
      case 'Onboarding':
        newPower.execute = false;
        break;
      default:
        break;
    }

    this.formService.addPower(newPower);
    this.formService.setSelectedPowerName('');
  }

  public removePower(powerToRemove: string): void {
    const dialogData: DialogData = {
        title: this.translate.instant("power.remove-dialog.title"),
        message: this.translate.instant("power.remove-dialog.message") + powerToRemove,
        confirmationType: 'sync',
        status: `default`
    }
    const removeAfterClose =  (): Observable<any> => {
      this.formService.removePower(powerToRemove);
      return EMPTY;
    };
    this.dialog.openDialogWithCallback(DialogComponent, dialogData, removeAfterClose);
  }

  public onHandleSelectChange(event: MatSelectChange): void {
    this.formService.setSelectedPowerName(event.value);
  }

  public isOptionDisabled(power: string): boolean {
    return this.formService.checkIfPowerIsAdded(power);
  }

}
