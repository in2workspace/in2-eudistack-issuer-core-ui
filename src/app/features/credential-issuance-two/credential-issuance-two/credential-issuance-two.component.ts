import { MachineConfirmDialogComponent } from './../machine-confirm-dialog/machine-confirm-dialog.component';
import { KeyGeneratorComponent } from './../key-generator/key-generator/key-generator.component';
import { MatLabel } from '@angular/material/form-field';
import { Component, computed, inject, Signal, signal, WritableSignal, effect } from '@angular/core';
import { MatFormField, MatOption, MatSelect } from '@angular/material/select';
import { CREDENTIAL_TYPES_ARRAY, CredentialType } from 'src/app/core/models/entity/lear-credential';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema } from 'src/app/core/models/entity/lear-credential-issuance-schemas';
import { CredentialIssuanceTwoService } from '../service/credential-issuance-two.service';
import { KeyValuePipe } from '@angular/common';
import { PowerTwoComponent } from '../power-two/power-two.component';
import { KeyState } from '../key-generator/key-generator.service';
import { map, Observable, of, startWith, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogData } from 'src/app/shared/components/dialog/dialog.component';
import { ComponentPortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-credential-issuance-two',
  standalone: true,
  imports: [MachineConfirmDialogComponent, KeyValuePipe, NgFor, ReactiveFormsModule, DynamicFieldComponent, KeyGeneratorComponent, MatFormField, MatLabel, MatOption, MatSelect, PowerTwoComponent],
  templateUrl: './credential-issuance-two.component.html',
  styleUrl: './credential-issuance-two.component.scss'
})
export class CredentialIssuanceTwoComponent {

  public readonly credentialTypesArr = CREDENTIAL_TYPES_ARRAY;
  public selectedCredentialType$: WritableSignal<CredentialType|undefined> = signal(undefined);
  // construir formulari per a template
  public credentialFormSchema$: Signal<CredentialIssuanceFormSchema|undefined> = computed(() => 
    this.selectedCredentialType$() 
  ? this.getCredentialFormSchema(this.selectedCredentialType$()!) 
  : undefined);
  //obtenir powers i passar-los a power component
  public power$ = computed(() => 
    this.selectedCredentialType$()  
    ? this.getPowerSchema(this.selectedCredentialType$()!) 
    : undefined
  );
  // obtenir keys
  public keys$ = signal<KeyState|undefined>(undefined);
  // obtenir validesa del conjunt
  public isSubmitDisabled$ = computed(() => {
    let isDisabled = !this.isFormValid$();
    if(this.selectedCredentialType$() === 'LEARCredentialMachine'){
      isDisabled = isDisabled && !this.keys$();
    }
    console.log('isSubmitDisabled' + isDisabled);
    return isDisabled
  });

  public form: FormGroup = new FormGroup({});
  public isFormValid$ = signal(false);
  private updateFormEffect = effect(() => {
    // reset keys
    this.updateKeys(undefined);

    //reset form
    this.form = this.credentialFormSchema$() 
    ? this.getCredentialFormFromSchema()
    : this.form
    console.log('Now form is ');
    console.log(this.form);

    this.form.valueChanges.pipe(
      map(() => this.form.valid ),
      startWith(false)
    ).subscribe(isValid => {
      console.log('form value changed; is valid? ' + isValid)
      this.isFormValid$.set(isValid);
    });

    //todo reset powers

  }, { allowSignalWrites: true});

  

  private readonly issuanceService = inject(CredentialIssuanceTwoService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly translate = inject(TranslateService);

  private getCredentialFormSchema(credType: CredentialType): CredentialIssuanceFormSchema{
    return this.issuanceService.getFormSchemaFromCredentialType(credType);
  }

  private getPowerSchema(credType: CredentialType): CredentialIssuancePowerFormSchema{
    return  this.issuanceService.getPowersSchemaFromCredentialType(credType);
  }

  private getCredentialFormFromSchema(){
    return this.issuanceService.issuanceFormBuilder(this.credentialFormSchema$()!)
  }

  public updateKeys(event: KeyState | undefined){
    this.keys$.set(event);
  }


  public onSubmit() {
    const f = this.form;
    if (f?.valid) {
      console.log('✅ Form valid', f.value);
    } else {
      f?.markAllAsTouched();
      console.log('invalid form: ');
      console.log(f?.value);
    }

    //open confirm
    if(this.selectedCredentialType$() === 'LEARCredentialMachine'){
      this.openLEARCredentialMachineSubmitDialog();
    }else{
      this.openSubmitDialog();
    }
  }

  private openSubmitDialog() {
    const dialogData: DialogData = {
      title: this.translate.instant("credentialIssuance.create-confirm-dialog.title"),
      message: this.translate.instant("credentialIssuance.create-confirm-dialog.message"),
      confirmationType: 'async',
      status: 'default',
      loadingData: {
        title: this.translate.instant("credentialIssuance.creating-credential"),
        message: ''
      }
    };

    const submitAfterDialogClose = (): Observable<any> => {
      return this.submitCredential();
    };
    this.dialog.openDialogWithCallback(dialogData, submitAfterDialogClose);
  }

  public openLEARCredentialMachineSubmitDialog(){
    const dialogData: DialogData = {
          title: "Títol prova",
          fullCustomTemplate: new ComponentPortal(MachineConfirmDialogComponent),
          message: "msg",
          confirmationType: 'async',
          status: 'default',
          loadingData: {
            title: this.translate.instant("credentialIssuance.creating-credential"),
            message: ''
          }
        };

    const submitAfterDialogClose = (): Observable<any> => {
      return this.submitCredential();
    };
    this.dialog.openDialogWithCallback(dialogData, submitAfterDialogClose);
  }

  private submitCredential(){
    console.log('credential submitted');
    return of();
  }


public onSelectionChange(selectedCredentialType: CredentialType, select: MatSelect) {
  const currentType = this.selectedCredentialType$();
  if (currentType !== undefined && currentType !== selectedCredentialType) {
    const shouldChange = window.confirm('Are you sure you want to change the type of credential? Your progress will be lost.');

    if (!shouldChange) {
      this.selectedCredentialType$.set(currentType);
      select.value = currentType;
      return;
    }
  }

  this.selectedCredentialType$.set(selectedCredentialType);
}


}
