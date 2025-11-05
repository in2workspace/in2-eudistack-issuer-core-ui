import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { IssuanceLEARCredentialRequestDto } from 'src/app/core/models/dto/lear-credential-issuance-request.dto';
import { IssuanceRequestFactoryService } from './issuance-request-factory.service';
import { EMPTY, from, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { IssuanceSchemaBuilder } from './issuance-schema-builders/issuance-schema-builder';
import { CredentialIssuanceViewModelField, CredentialIssuanceViewModelSchemaWithId, ISSUANCE_CREDENTIAL_TYPES_ARRAY, IssuanceCredentialType, IssuanceRawCredentialPayload, IssuanceStaticViewModel, IssuanceViewModelsTuple } from 'src/app/core/models/entity/lear-credential-issuance';
import { ExtendedValidatorFn, ValidatorEntry } from 'src/app/core/models/entity/validator-types';
import { ALL_VALIDATORS_FACTORY_MAP, ValidatorName } from 'src/app/shared/validators/credential-issuance/all-validators';
import { MatSelect } from '@angular/material/select';
import { TranslateService } from '@ngx-translate/core';
import { CanDeactivateType } from 'src/app/core/guards/can-component-deactivate.guard';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { ConditionalConfirmDialogData, DialogData } from 'src/app/shared/components/dialog/dialog-data';
import { ConditionalConfirmDialogComponent } from 'src/app/shared/components/dialog/conditional-confirm-dialog/conditional-confirm-dialog.component';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { Router } from '@angular/router';


@Injectable() //provided in Issuance Component
export class CredentialIssuanceService {

  // CREDENTIAL TYPE SELECTOR
  public readonly credentialTypesArr: Readonly<IssuanceCredentialType[]> = ISSUANCE_CREDENTIAL_TYPES_ARRAY;
  public selectedCredentialType$ = signal<IssuanceCredentialType|undefined>(undefined);

  // BUILD SCHEMAS FROM CREDENTIAL TYPE
  public credentialViewModels$ = computed<IssuanceViewModelsTuple | null>(() => 
    this.selectedCredentialType$() 
    ? this.issuanceViewModelsBuilder(this.selectedCredentialType$()!, this.onBehalf$())
    : null
  );

  // SIDE (STATIC CREDENTIAL DATA)
  public staticData$ = computed<IssuanceStaticViewModel | null>(() => {
    const schema = this.credentialViewModels$();
    const staticData = schema?.[1] ?? null;
    return staticData && Object.keys(staticData).length > 0
    ? staticData
    : null;
  });


  // MAIN (FORM SCHEMA AND FORM GROUP)
  public credentialFormSchema$ = computed<CredentialIssuanceViewModelSchemaWithId | null>(() => {
    const schema = this.credentialViewModels$();
    return schema ? 
    schema[0] :
    null
  });

  public form$ = computed<FormGroup>(() => { 
    return this.credentialFormSchema$() 
      ? this.formBuilder(this.credentialFormSchema$()!, this.onBehalf$())
      : new FormGroup({})
  });

  public formValue$ = toSignal(
    toObservable(this.form$).pipe(
      switchMap(f => f.valueChanges.pipe(startWith(f.getRawValue())))
    ),
    { initialValue: this.form$().getRawValue() }
  ) as Signal<Record<string, any>>;

  public isFormValid$ = toSignal(
    toObservable(this.form$).pipe(
      switchMap(f => f.statusChanges.pipe(startWith(f.status))),
      map((status) => status === 'VALID')
    ),
    { initialValue: this.form$().valid }
  );

  // OTHER STATES
  public onBehalf$ = signal<boolean>(false);
  // avoids "canLeave alert" after submitting and being redirected to home
  public hasSubmitted$ = signal<boolean>(false);

  // alert messages that are displayed above the submit button
  public bottomAlertMessages$: WritableSignal<string[]> = signal([]);

  private readonly credentialRequestFactory = inject(IssuanceRequestFactoryService);
  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly router = inject(Router);
  private readonly schemaBuilder = inject(IssuanceSchemaBuilder);
  private readonly translate = inject(TranslateService);

  public updateSelectedType(selectedCredentialType: IssuanceCredentialType, select: MatSelect) {
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
    this.selectedCredentialType$.set(selectedCredentialType);
  }

  // if the message is new, add it; otherwise, delete it
  // this is called by some custom form child components
  public updateAlertMessages(messages: string[]): void{
    const currentMessages = this.bottomAlertMessages$();

    const updatedMessages = [...currentMessages];

    for (const message of messages) {
      const index = updatedMessages.indexOf(message);
      if (index !== -1) {
        updatedMessages.splice(index, 1);
      } else {
        updatedMessages.push(message);
      }
    }
    this.bottomAlertMessages$.set(updatedMessages);
}

  public canLeave(): boolean{
    const dataHasBeenUpdated = this.form$().dirty;
    return this.hasSubmitted$() || !dataHasBeenUpdated;
  }

  public canDeactivate(): CanDeactivateType {
      const canLeave = this.canLeave();
      if(canLeave) return canLeave;
      return this.openLeaveConfirm();
  }

  public openLeaveConfirm(): boolean{
    const alertMsg = this.translate.instant("credentialIssuance.unloadAlert");
    const confirm = window.confirm(alertMsg);
    return confirm;
  }  

  // this is the default dialog to confirm the form submission
  public openSubmitDialog() {
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

  // LEARCredentialMachine needs a dialog with a checkbox to confirm
  public openLEARCredentialMachineSubmitDialog(){
    const dialogData: ConditionalConfirmDialogData = {
          title: this.translate.instant("credentialIssuance.create-confirm-dialog.title"),
          message: this.translate.instant("credentialIssuance.create-confirm-dialog.message"),
          checkboxLabel: this.translate.instant("credentialIssuance.create-confirm-dialog.checkboxLabel"),
          belowText: this.translate.instant("credentialIssuance.create-confirm-dialog.belowText"),
          status: 'default',
          confirmationType: 'async',
          loadingData: {
            title: this.translate.instant("credentialIssuance.creating-credential"),
            message: ''
          }
        };


    this.dialog.openDialogWithCallback(ConditionalConfirmDialogComponent, dialogData, this.submitAsCallback);
  }

  private issuanceViewModelsBuilder(credType: "LEARCredentialEmployee" | "LEARCredentialMachine", onBehalf: boolean): IssuanceViewModelsTuple{
    return this.schemaBuilder.formSchemasBuilder(credType, onBehalf);
  }

  private formBuilder(
  schema: CredentialIssuanceViewModelField[],
  onBehalf: boolean
): FormGroup {
  const controls: Record<string, AbstractControl> = {};

  for (const field of schema) {
    if (
      field.type === 'group' &&
      !onBehalf &&
      (field.display === 'pref_side' || field.display === 'side')
    ) {
      continue;
    }

    switch (field.type) {
      case 'control': {
        const validators = (field.validators ?? [])
          .map(this.getValidatorFn)
          .filter((v): v is ExtendedValidatorFn => !!v);

        const initialValue = field.staticValueGetter?.() ?? null;

        controls[field.key] = new FormControl(initialValue, { validators });
        break;
      }

      case 'group': {
        const childSchema = field.groupFields ?? [];
        controls[field.key] = this.formBuilder(childSchema, onBehalf);
        break;
      }

    }
  }

  return new FormGroup(controls);
}

  private readonly submitAsCallback = (): Observable<any> => {
      return this.submitCredentialPayload();
  };

  private submitCredentialPayload(): Observable<any>{
      const formValue = this.formValue$();
      const credentialType = this.selectedCredentialType$();
      const credentialSchema = this.credentialFormSchema$();
      if(!this.isFormValid$()){
        console.error('Invalid form values! Cannot submit.');
        return of(EMPTY);
      }
      if(!credentialType || !credentialSchema){
        console.error('SubmitCredential: type or schema missing!');
        return of(EMPTY);
      }
  
      const rawCredentialPayload: IssuanceRawCredentialPayload = { 
        formData: formValue, 
        staticData: this.staticData$(),
        onBehalf: this.onBehalf$()
      }

      const request = this.buildCredentialRequest(rawCredentialPayload, credentialType);
  
      return this.sendCredentialRequest(request).pipe(
        // After submitting credential, show success popup and navigate to dashboard after close
        tap(() => {this.hasSubmitted$.set(true); }),
        switchMap(() => this.openSuccessfulCreateDialog()),
        switchMap(() => from(this.navigateToCredentials())),
        tap(() => location.reload() )
      );
    }

  private navigateToCredentials(): Promise<boolean> {
    return this.router.navigate(['/organization/credentials']);
  }
  
  private buildCredentialRequest(
    credentialData: IssuanceRawCredentialPayload, 
    credentialType: IssuanceCredentialType,
  ): IssuanceLEARCredentialRequestDto{
   
    return this.buildRequestDto(credentialData, credentialType);
    
  }


  private getValidatorFn(entry: ValidatorEntry<ValidatorName>): ExtendedValidatorFn | null {
    const factory = ALL_VALIDATORS_FACTORY_MAP[entry.name];
    return factory ? factory(...(entry.args ?? [])) : null;
  }

  private buildRequestDto(credentialData: IssuanceRawCredentialPayload, credentialType: IssuanceCredentialType): IssuanceLEARCredentialRequestDto{
    return this.credentialRequestFactory.createCredentialRequest(credentialData, credentialType);
  }

  private sendCredentialRequest(credentialPayload: IssuanceLEARCredentialRequestDto): Observable<void>{
    return this.credentialProcedureService.createProcedure(credentialPayload);
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
