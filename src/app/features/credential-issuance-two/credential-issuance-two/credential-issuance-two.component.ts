import { ConditionalConfirmDialogData } from './../../../shared/components/dialog/conditional-confirm-dialog/conditional-confirm-dialog.component';
import { MatButton } from '@angular/material/button';
import { KeyGeneratorComponent } from './../key-generator/key-generator/key-generator.component';
import { MatLabel } from '@angular/material/form-field';
import { Component, computed, inject, Signal, signal, WritableSignal, effect, HostListener } from '@angular/core';
import { MatFormField, MatOption, MatSelect } from '@angular/material/select';
import { CredentialType, EmployeeMandator, ISSUANCE_CREDENTIAL_TYPES_ARRAY, TmfAction, TmfFunction } from 'src/app/core/models/entity/lear-credential';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgFor, TitleCasePipe } from '@angular/common';
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema } from 'src/app/core/models/entity/lear-credential-issuance-schemas';
import { CredentialIssuanceTwoService } from '../service/credential-issuance-two.service';
import { KeyValuePipe } from '@angular/common';
import { PowerTwoComponent, PowerValueAndValidity } from '../power-two/power-two.component';
import { KeyState } from '../key-generator/key-generator.service';
import { EMPTY, from, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogData } from 'src/app/shared/components/dialog/dialog-data';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { ConditionalConfirmDialogComponent } from 'src/app/shared/components/dialog/conditional-confirm-dialog/conditional-confirm-dialog.component';
import { RawCredentialPayload } from 'src/app/core/models/dto/lear-credential-issuance-request.dto';
import { ActivatedRoute, CanDeactivate, Router } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CanComponentDeactivate, CanDeactivateType } from 'src/app/core/guards/can-component-deactivate.guard';

export type CredentialGlobalFormState = {
    keys: KeyState | undefined;
    form: {};
    power: RawFormPower;
}

export type RawFormPower = Partial<Record<TmfFunction, Record<TmfAction, boolean>>>;

@Component({
  selector: 'app-credential-issuance-two',
  standalone: true,
  imports: [KeyValuePipe, NgFor, ReactiveFormsModule, DynamicFieldComponent, KeyGeneratorComponent, MatButton, MatCard, MatCardContent, MatFormField, MatLabel, MatOption, MatSelect, PowerTwoComponent, TitleCasePipe, TranslatePipe],
  templateUrl: './credential-issuance-two.component.html',
  styleUrl: './credential-issuance-two.component.scss'
})
export class CredentialIssuanceTwoComponent implements CanDeactivate<CanComponentDeactivate>{
  @HostListener('window:beforeunload', ['$event'])
  private unloadAlert($event: BeforeUnloadEvent): void{
    const canLeave = this.canLeave();
    if(!canLeave){
      const alertMsg = this.translate.instant("credentialIssuance.unloadAlert");
      const confirm = window.confirm(alertMsg);
      if(confirm) return;
      $event.preventDefault();
    }else{
      return;
    }
  }

  public canDeactivate(): CanDeactivateType {
    return this.canLeave();
  }

  private canLeave(): boolean{
    const dataHasBeenUpdated = this.form.touched || !!this.keys$() || this.powersHasOneFunction$();
    return !this.hasSubmitted && !dataHasBeenUpdated;
  }

  private readonly issuanceService = inject(CredentialIssuanceTwoService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  public asSigner: boolean = true;
  //  todo = this.route.snapshot.pathFromRoot
  //     .flatMap(r => r.url)
  //     .map(seg => seg.path)
  //     .includes('create-as-signer');

  //CREDENTIAL TYPE SELECTOR
  public readonly credentialTypesArr = ISSUANCE_CREDENTIAL_TYPES_ARRAY;
  public selectedCredentialType$: WritableSignal<CredentialType|undefined> = signal(undefined);

  //BUILD SCHEMAS FROM CREDENTIAL TYPE
  public credentialFormSchema$: Signal<CredentialIssuanceFormSchema|undefined> = computed(() => 
    this.selectedCredentialType$() 
  ? this.getCredentialFormSchema(this.selectedCredentialType$()!) 
  : undefined);
  
  public powerFormSchema$ = computed(() => 
    this.selectedCredentialType$()  
    ? this.getPowerSchema(this.selectedCredentialType$()!) 
    : undefined
  );

  //CREDENTIAL DATA STATES

  //CREDENTIAL STATE
  //Keys
  public keys$ = signal<KeyState|undefined>(undefined);
  //Power form
  //todo type
  public powersValue$ = signal<RawFormPower>({} as RawFormPower);
  public powersHasOneFunction$ = signal<boolean>(false);
  public powersHaveOneAction$ = signal<boolean>(false);
  public powersIsValid$ = computed(() => {
    return this.powersHasOneFunction$() && this.powersHaveOneAction$()
  });
  //Main form
  public form: FormGroup = new FormGroup({});
  public formValue$ = signal<FormGroup>(this.form.value);
  public isFormValid$ = signal<boolean>(false);

  //Global credential states
  public globalValue$: Signal<CredentialGlobalFormState> = computed(() => {
    return { keys: this.keys$(), form: this.formValue$(), power: this.powersValue$()}
  });

  public isGlobalValid$: Signal<boolean> = computed(() => {
    let isValid = this.isFormValid$();
    if(this.selectedCredentialType$() === 'LEARCredentialMachine'){
      isValid = isValid && !!this.keys$();
    }
    if(this.powerFormSchema$()){
      isValid = isValid && this.powersIsValid$();
    }
    console.log('isSubmitDisabled' + isValid);
    return isValid;
  });
  private hasSubmitted: boolean = false;

  // SIDE (STATIC CREDENTIAL DATA)
  public staticData$ = computed<{
    mandator: EmployeeMandator;
} | null>(() =>  {
    //todo idealment, l'esquema hauria de passar la font dels valors estàtics
    if(!this.asSigner){
      const type = this.selectedCredentialType$();
      if(!(type === 'LEARCredentialEmployee' || type === 'LEARCredentialMachine')) return null;
      //busca claus amb display:pref_side
      //todo restore
      // return this.issuanceService.getRawMandator();
      return {
        mandator: {
          organizationIdentifier: 'ORG123',
          organization: 'Test Org',
          commonName: 'Some Name',
          emailAddress: 'some@example.com',
          serialNumber: '123',
          country: 'SomeCountry'
        }
      };
    }else{
      return  null;
    }
  });

    
  // every time a new credential type > credential schema is selected, reset global state
  private updateFormEffect = effect(() => {
    // reset keys
    this.updateKeys(undefined);

    //todo fer-ho amb funció recursiva d'eliminar i afegir controls per evitar repetir subscribe?
    //reset form
    this.form = this.credentialFormSchema$() 
      ? this.getCredentialFormFromSchema()
      : this.form;
    console.log('Now form is ');
    console.log(this.form);

    //todo untilDestroyed / formReset
    this.form.valueChanges.pipe(
      map(val => [val, this.form.valid] ),
      startWith([this.form.value, false])
    ).subscribe(formState => {
      console.log('form value changed; is valid? ' + formState[1]);
      this.formValue$.set(formState[0])
      this.isFormValid$.set(formState[1]);
    });

    //No need to reset powers; they are automatically reset when the powersFormSchema passed as input changes
  }, { allowSignalWrites: true});


  private getCredentialFormSchema(credType: CredentialType): CredentialIssuanceFormSchema{
    return this.issuanceService.getFormSchemaFromCredentialType(credType);
  }

  private getPowerSchema(credType: CredentialType): CredentialIssuancePowerFormSchema{
    return  this.issuanceService.getPowersSchemaFromCredentialType(credType);
  }

  private getCredentialFormFromSchema(): FormGroup{
    return this.issuanceService.issuanceFormBuilder(this.credentialFormSchema$()!, this.asSigner);
  }

  public updateKeys(event: KeyState | undefined): void{
    this.keys$.set(event);
  }


  public onSubmit() {
    const isGlobalValid = this.isGlobalValid$();
    const globalValue = this.globalValue$();
    if (isGlobalValid) {
      console.log('✅ Form valid', globalValue);
    } 
    else {
      console.error('Invalid form: ');
      console.log(globalValue);
      // todo restore
      // return;
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

    this.dialog.openDialogWithCallback(DialogComponent, dialogData, this.submitAsCallback);
  }

  public openLEARCredentialMachineSubmitDialog(){
    const dialogData: ConditionalConfirmDialogData = {
          title: this.translate.instant("credentialIssuance.create-confirm-dialog.title"),
          message: this.translate.instant("credentialIssuance.create-confirm-dialog.message"),
          checkboxLabel: this.translate.instant("credentialIssuance.create-confirm-dialog.checkboxLabel"),
          belowText: this.translate.instant("credentialIssuance.create-confirm-dialog.belowText"),
          status: 'default',
          confirmationType: 'async'
        };


    this.dialog.openDialogWithCallback(ConditionalConfirmDialogComponent, dialogData, this.submitAsCallback);
  }

  private readonly submitAsCallback = (): Observable<any> => {
      return this.submitCredential();
    };

  private submitCredential(){
    const credential = this.globalValue$();
    console.log('SUBMIT CREDENTIAL: ');
    console.log(credential);
    const credentialType = this.selectedCredentialType$();
    const credentialSchema = this.credentialFormSchema$();
    // todo restore
    // if(!this.isGlobalValid$()){
    //   console.error('Invalid global values! Cannot submit.');
    //   return of(EMPTY);
    // }
    if(!credentialType || !credentialSchema){
      console.error('SubmitCredential: type or schema missing!');
      return of(EMPTY);
    }
    const dataForCredentialPayload: RawCredentialPayload = { 
      partialCredentialSubject: credential.form, 
      power: credential.power, 
      optional: { keys: credential.keys, staticData:this.staticData$() },
      asSigner: this.asSigner
    }
    return this.issuanceService.submitCredential(dataForCredentialPayload, credentialType).pipe(
      tap(() => {this.hasSubmitted = true; }),
      switchMap(() => from(this.navigateToCredentials())),
      tap(() => location.reload() )
    );
  }

  public navigateToCredentials(): Promise<boolean> {
    return this.router.navigate(['/organization/credentials']);
  }


public onSelectionChange(selectedCredentialType: CredentialType, select: MatSelect) {
  const currentType = this.selectedCredentialType$();
  if (currentType !== undefined && currentType !== selectedCredentialType) {
    const alertMsg = this.translate.instant("credentialIssuance.changeCredentialAlert");
    const shouldChange = window.confirm(alertMsg);

    if (!shouldChange) {
      this.selectedCredentialType$.set(currentType);
      select.value = currentType;
      return;
    }
  }
  this.form = new FormGroup({});
  this.selectedCredentialType$.set(selectedCredentialType);
}

updatePowers(powerState: PowerValueAndValidity){
  console.log('update powers in issuance two');
  console.log(powerState)
  this.powersValue$.set(powerState.value);
  this.powersHasOneFunction$.set(powerState.hasOnePower);
  this.powersHaveOneAction$.set(powerState.hasOneActionPerPower);
}

}
