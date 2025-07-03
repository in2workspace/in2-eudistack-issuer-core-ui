import { MatButton } from '@angular/material/button';
import { MatLabel } from '@angular/material/form-field';
import { Component, computed, inject, Signal, signal, WritableSignal, effect, HostListener, OnDestroy } from '@angular/core';
import { MatFormField, MatOption, MatSelect } from '@angular/material/select';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgFor, TitleCasePipe, KeyValuePipe } from '@angular/common';
import { IssuancePowerValueAndValidity, IssuancePowerComponent } from '../power/issuance-power.component';
import { EMPTY, from, map, Observable, of, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConditionalConfirmDialogData, DialogData } from 'src/app/shared/components/dialog/dialog-data';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { ConditionalConfirmDialogComponent } from 'src/app/shared/components/dialog/conditional-confirm-dialog/conditional-confirm-dialog.component';
import { ActivatedRoute, CanDeactivate, Router } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CanComponentDeactivate, CanDeactivateType } from 'src/app/core/guards/can-component-deactivate.guard';
import { CredentialIssuanceService } from '../../services/credential-issuance.service';
import { KeyState } from '../../services/key-generator.service';
import { KeyGeneratorComponent } from '../key-generator/key-generator.component';
import { IssuanceRawCredentialPayload } from 'src/app/core/models/dto/lear-credential-issuance-request.dto';
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema, ISSUANCE_CREDENTIAL_TYPES_ARRAY, IssuanceCredentialType } from 'src/app/core/models/entity/lear-credential-issuance';
import { EmployeeMandator, TmfFunction, TmfAction } from 'src/app/core/models/entity/lear-credential';

export type CredentialIssuanceGlobalFormState = {
    keys: KeyState | undefined;
    form: Record<string, any>;
    power: IssuanceRawPowerForm;
}

export type IssuanceStaticDataSchema = {
    mandator?: EmployeeMandator;
}

export type IssuanceRawPowerForm = Partial<Record<TmfFunction, Record<TmfAction, boolean>>>;

@Component({
  selector: 'app-credential-issuance',
  standalone: true,
  imports: [KeyValuePipe, NgFor, ReactiveFormsModule, DynamicFieldComponent, IssuancePowerComponent, KeyGeneratorComponent, MatButton, MatCard, MatCardContent, MatFormField, MatLabel, MatOption, MatSelect, TitleCasePipe, TranslatePipe],
  templateUrl: './credential-issuance.component.html',
  styleUrl: './credential-issuance.component.scss'
})
export class CredentialIssuanceComponent implements CanDeactivate<CanComponentDeactivate>, OnDestroy{
  
  //CREDENTIAL TYPE SELECTOR
  public readonly credentialTypesArr = ISSUANCE_CREDENTIAL_TYPES_ARRAY;
  public selectedCredentialType$: WritableSignal<IssuanceCredentialType|undefined> = signal(undefined);
  public needsKeys$: Signal<boolean> = computed(() => {
    return this.selectedCredentialType$() === 'LEARCredentialMachine'
  });

  //BUILD SCHEMAS FROM CREDENTIAL TYPE
  public credentialSchemas$: Signal<[CredentialIssuanceFormSchema, IssuanceStaticDataSchema] | null> = computed(() => 
    this.selectedCredentialType$() 
  ? this.getCredentialFormSchemas(this.selectedCredentialType$()!) 
  : null);

  public credentialFormSchema$: Signal<CredentialIssuanceFormSchema | null> = computed(() => {
    const schema = this.credentialSchemas$();
      return schema ? 
      schema[0] :
      null
    });
  
  public powerFormSchema$: Signal<CredentialIssuancePowerFormSchema | undefined> = computed(() => 
    this.selectedCredentialType$()  
    ? this.getPowerSchema(this.selectedCredentialType$()!) 
    : undefined
  );

  //CREDENTIAL DATA STATES

  //CREDENTIAL STATE
  //Keys
  public keys$ = signal<KeyState|undefined>(undefined);
  //Power form
  public powersValue$ = signal<IssuanceRawPowerForm>({} as IssuanceRawPowerForm);
  public powersHasOneFunction$ = signal<boolean>(false);
  public powersHaveOneAction$ = signal<boolean>(false);
  public powersIsValid$: Signal<boolean> = computed(() => {
    return this.powersHasOneFunction$() && this.powersHaveOneAction$()
  });
  //Main form
  public form: FormGroup = new FormGroup({});
  public formValue$ = signal<FormGroup>(this.form.value); //updated by effect
  public isFormValid$ = signal<boolean>(false);

  //Global credential states
  public globalValue$: Signal<CredentialIssuanceGlobalFormState> = computed(() => {
    return { keys: this.keys$(), form: this.formValue$(), power: this.powersValue$()}
  });

  public isGlobalValid$: Signal<boolean> = computed(() => {
    let isValid = this.isFormValid$();
    if(this.needsKeys$()){
      isValid = isValid && !!this.keys$();
    }
    if(this.powerFormSchema$()){
      isValid = isValid && this.powersIsValid$();
    }
    console.log('isSubmitDisabled' + isValid);
    return isValid;
  });

  // SIDE (STATIC CREDENTIAL DATA)
  public staticData$ = computed<IssuanceStaticDataSchema | null>(() => {
    const schema = this.credentialSchemas$();
    const staticData = schema?.[1] ?? null;
    return staticData && Object.keys(staticData).length > 0
    ? staticData
    : null;
  });

  public asSigner: boolean;
  private hasSubmitted: boolean = false;

  private readonly issuanceService = inject(CredentialIssuanceService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  private readonly destroy$ = new Subject();

  // every time a new credential type > credential schema is selected, reset global state
  private readonly updateFormEffect = effect(() => {
    // reset keys
    this.updateKeys(undefined);

    //todo fer-ho amb funció recursiva d'eliminar (semblant a power component) i afegir controls per evitar repetir subscribe?
    //reset form
    this.form = this.credentialFormSchema$() 
      ? this.getCredentialFormFromSchema()
      : this.form;
    console.log('Now form is ');
    console.log(this.form);

    //todo untilDestroyed / formReset
    this.form.valueChanges.pipe(
      map(val => [val, this.form.valid] ),
      startWith([this.form.value, false]),
      takeUntil(this.destroy$)
    ).subscribe(formState => {
      console.log('form value changed; is valid? ' + formState[1]);
      this.formValue$.set(formState[0])
      this.isFormValid$.set(formState[1]);
    });

    //No need to reset powers; they are automatically reset when the powersFormSchema passed as input changes
  }, { allowSignalWrites: true});

  public constructor(){
    this.asSigner = this.route.snapshot.pathFromRoot
      .flatMap(r => r.url)
      .map(seg => seg.path)
      .includes('create-as-signer');
  }

  @HostListener('window:beforeunload', ['$event'])
  private unloadAlert($event: BeforeUnloadEvent): void{
    const canLeave = this.canLeave();
    if(!canLeave){
      const confirm = this.openLeaveConfirm();
      //todo maybe use event.returnValue
      if(!confirm) $event.preventDefault();
    }
  }

  public onSelectionChange(selectedCredentialType: IssuanceCredentialType, select: MatSelect) {
    const currentType = this.selectedCredentialType$();
    const hasChangedType = currentType !== undefined && currentType !== selectedCredentialType
    if (hasChangedType && !this.canLeave()) {
      const alertMsg = this.translate.instant("credentialIssuance.changeCredentialAlert");
      const shouldChange = window.confirm(alertMsg);

      if (!shouldChange) {
        select.value = currentType;
        return;
      }
    }
    this.form = new FormGroup({});
    this.selectedCredentialType$.set(selectedCredentialType);
  }

  public canDeactivate(): CanDeactivateType {
    const canLeave = this.canLeave();
    if(canLeave) return canLeave;
    return this.openLeaveConfirm();
  }

  public updateKeys(event: KeyState | undefined): void{
    this.keys$.set(event);
  }

  public updatePowers(powerState: IssuancePowerValueAndValidity){
    console.log('update powers in issuance two');
    console.log(powerState)
    this.powersValue$.set(powerState.value);
    this.powersHasOneFunction$.set(powerState.hasOnePower);
    this.powersHaveOneAction$.set(powerState.hasOneActionPerPower);
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

  public navigateToCredentials(): Promise<boolean> {
    return this.router.navigate(['/organization/credentials']);
  }

  public ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  private canLeave(): boolean{
    const dataHasBeenUpdated = this.form.dirty || !!this.keys$() || this.powersHasOneFunction$();
    return this.hasSubmitted || !dataHasBeenUpdated;
  }

  private openLeaveConfirm(): boolean{
    const alertMsg = this.translate.instant("credentialIssuance.unloadAlert");
    const confirm = window.confirm(alertMsg);
    return confirm;
  }  

  private getCredentialFormSchemas(credType: IssuanceCredentialType): [CredentialIssuanceFormSchema, IssuanceStaticDataSchema]{
    return this.issuanceService.schemasBuilder(credType, this.asSigner);
  }

  private getPowerSchema(credType: IssuanceCredentialType): CredentialIssuancePowerFormSchema{
    return  this.issuanceService.getPowersSchemaFromCredentialType(credType);
  }

  private getCredentialFormFromSchema(): FormGroup{
    return this.issuanceService.formBuilder(this.credentialFormSchema$()!, this.asSigner);
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

  private openLEARCredentialMachineSubmitDialog(){
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
    if(!this.isGlobalValid$()){
      console.error('Invalid global values! Cannot submit.');
      return of(EMPTY);
    }
    if(!credentialType || !credentialSchema){
      console.error('SubmitCredential: type or schema missing!');
      return of(EMPTY);
    }
    const dataForCredentialPayload: IssuanceRawCredentialPayload = { 
      partialCredentialSubject: credential.form, 
      power: credential.power, 
      optional: { keys: credential.keys, staticData:this.staticData$() },
      asSigner: this.asSigner
    }
    return this.issuanceService.submitCredential(dataForCredentialPayload, credentialType).pipe(
      // After submitting credential, show success popup and navigate to dashboard after close
      tap(() => {this.hasSubmitted = true; }),
      switchMap(() => this.openSuccessfulCreateDialog()),
      switchMap(() => from(this.navigateToCredentials())),
      tap(() => location.reload() )
    );
  }

  private openSuccessfulCreateDialog(): Observable<any>{
    const dialogData: DialogData = {
      title: this.translate.instant("credentialIssuance.create-success-dialog.title"),
      message: this.translate.instant("credentialIssuance.create-success-dialog.message"),
      confirmationType: 'none',
      status: 'default'
    };

    const dialogRef = this.dialog.openDialog(DialogComponent, dialogData);
    return dialogRef.afterClosed();
  }

}
