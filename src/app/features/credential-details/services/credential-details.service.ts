import { computed, inject, Injectable, Injector, Signal, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { CredentialStatus, CredentialType, LEARCredential, CredentialProcedureDetails, LifeCycleStatus, CREDENTIAL_TYPES_ARRAY } from 'src/app/core/models/entity/lear-credential';
import { ComponentPortal } from '@angular/cdk/portal';
import { LearCredentialEmployeeDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-employee-details-schema';
import { LearCredentialMachineDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-machine-details-schema';
import { GxLabelCredentialDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/gx-label-credential-details-schema';
import { VerifiableCertificationDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/verifiable-certification-details-schema';
import { MappedExtendedDetailsField, TemplateSchema, MappedTemplateSchema, DetailsField, MappedDetailsField, CustomDetailsField, MappedExtendedDetailsGroupField } from 'src/app/core/models/entity/lear-credential-details';
import { LifeCycleStatusService } from 'src/app/shared/services/life-cycle-status.service';
import { CredentialActionsService } from './credential-actions.service';
import { StatusClass } from 'src/app/core/models/entity/lear-credential-management';
import { statusHasSendReminderlButton, credentialTypeHasSendReminderButton, statusHasSignCredentialButton, credentialTypeHasSignCredentialButton, statusHasRevokeCredentialButton, credentialTypeHasRevokeCredentialButton } from '../helpers/actions-helpers';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';


@Injectable() //provided in component
export class CredentialDetailsService {
  // CREDENTIAL DATA
  public procedureId$ = signal<string>('');
  public credentialDetailsData$ = signal<CredentialProcedureDetails | undefined>(undefined);
  public lifeCycleStatus$ = computed<LifeCycleStatus | undefined>(() => {
    return this.credentialDetailsData$()?.lifeCycleStatus;
  });
  public credential$ = computed<LEARCredential | undefined>(() => {
    const credentialProcedureData = this.credentialDetailsData$();
    return credentialProcedureData?.credential?.vc;
  });
  public credentialValidFrom$ = computed<string>(() => {
    return this.credential$()?.validFrom ?? '';
  });
  public credentialValidUntil$ = computed<string>(() => {
    return this.credential$()?.validUntil ?? '';
  });
  public credentialType$ = computed<CredentialType | undefined>(() => {
    const vc = this.credential$();
    return vc ? this.getCredentialType(vc) : undefined;
  });
  public lifeCycleStatusClass$: Signal<StatusClass | undefined>;
  public credentialStatus$ = computed<CredentialStatus | undefined>(() => {
    return this.credential$()?.credentialStatus;
  })

  //MODELS
  public sideTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined> = signal(undefined);
  public mainTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined> = signal(undefined);
  public showSideTemplateCard$ = computed<boolean>(() =>
    Boolean(this.sideTemplateModel$()?.length)
  );

  //BUTTONS
  public showReminderButton$ = computed<boolean>(() => {
    const type = this.credentialType$();
    const status = this.lifeCycleStatus$();

    return !!(
      status 
      && statusHasSendReminderlButton(status)
      && type 
      && credentialTypeHasSendReminderButton(type)
    );
  });
  
  public showSignCredentialButton$ = computed<boolean>(()=>{
    const type = this.credentialType$();
    const status = this.lifeCycleStatus$();

    return !!(
      status
      && statusHasSignCredentialButton(status)
      && type 
      && credentialTypeHasSignCredentialButton(type)
    );
  });

  public showRevokeCredentialButton$ = computed<boolean>(()=>{
    const type = this.credentialType$();
    const status = this.lifeCycleStatus$();

    return !!(
      status
      && statusHasRevokeCredentialButton(status)
      && type 
      && credentialTypeHasRevokeCredentialButton(type)
    );
  });

  public enableRevokeCredentialButton$ = computed(() => {
    return !!this.credentialStatus$();
  });

  public showActionsButtonsContainer$ = computed<boolean>(() => {
    return this.showSignCredentialButton$() || this.showReminderButton$() || this.showRevokeCredentialButton$()
  });

  private readonly actionsService = inject(CredentialActionsService);
  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly statusService = inject(LifeCycleStatusService);

  
  private readonly schemasByTypeMap: Record<CredentialType, TemplateSchema> = {
    'LEARCredentialEmployee': LearCredentialEmployeeDetailsTemplateSchema,
    'LEARCredentialMachine': LearCredentialMachineDetailsTemplateSchema,
    'VerifiableCertification': VerifiableCertificationDetailsTemplateSchema,
    'gx:LabelCredential': GxLabelCredentialDetailsTemplateSchema,
  } as const;

  public constructor(){
    this.lifeCycleStatusClass$ = computed(() => {
      const status = this.lifeCycleStatus$();
      if(!status) return 'status-default';
      return this.statusService.mapStatusToClass(status)
    });
  }

  public setProcedureId(id: string) {
    this.procedureId$.set(id);
  }

  public loadCredentialModels(injector: Injector): void {  
    this.loadCredentialDetails()
    .subscribe(data => {
      this.credentialDetailsData$.set(data);
      const vc = this.credential$();
      if(!vc) throw Error('No credential found.');

      const type = this.credentialType$();
      if(!type){
       console.error('Credential: ');
       console.error(vc);
       throw Error('No credential type found in credential: ');
      }

      const schema = this.getSchemaByType(type);
      const mappedSchema = this.mapSchemaValues(schema, vc);
      this.setTemplateModels(mappedSchema, injector);
    });
  }

  public openSendReminderDialog(): void {
    const procedureId = this.getProcedureId();
    return this.actionsService.openSendReminderDialog(procedureId);
  }

  public openSignCredentialDialog(): void {
    const procedureId = this.getProcedureId();
    return this.actionsService.openSignCredentialDialog(procedureId);
  }

  public openRevokeCredentialDialog(): void{
    if(this.lifeCycleStatus$() !== 'VALID'){
      console.error("Only credentials with status VALID can be revoked.");
      this.dialog.openErrorInfoDialog(DialogComponent, 'error.unknown_error');
      return;
    }
    if(!this.credentialStatus$()){
      console.error("Only credentials with statusCredential field can be revoked.");
      this.dialog.openErrorInfoDialog(DialogComponent, 'error.unknown_error');
      return;
    }
    const credentialId = this.getCredentialId();
    if(!credentialId){
      console.error("Couldn't get credential id from vc.");
      this.dialog.openErrorInfoDialog(DialogComponent, 'error.unknown_error');
      return;
    }
    const listId = this.getCredentialListId();
    if(!listId){
      console.error("Couldn't get credential list from vc.");
      this.dialog.openErrorInfoDialog(DialogComponent, 'error.unknown_error');
      return;
    }
    return this.actionsService.openRevokeCredentialDialog(credentialId, listId);
  }

  private getProcedureId(): string{
    return this.procedureId$();
  }

  private getCredential(): LEARCredential | undefined{
    return this.credentialDetailsData$()?.credential?.vc;
  }

  private getCredentialId(): string | undefined {
    return this.getCredential()?.id;
  }

  private getCredentialListId(): string {
    const statusListCredential = this.getCredential()?.credentialStatus?.statusListCredential;
    
    if(!statusListCredential){
      console.error('No Status List Credential found in vc: ');
      console.error(this.getCredential());
      return "";
    }
    
    const id = statusListCredential[statusListCredential.length - 1];
    return id;
  }

  
  private loadCredentialDetails(): Observable<CredentialProcedureDetails> {
    return this.credentialProcedureService.getCredentialProcedureById(this.procedureId$());
  }

  private getSchemaByType(credType: CredentialType): TemplateSchema{
    return this.schemasByTypeMap[credType];
  }
      
  private getCredentialType(cred: LEARCredential): CredentialType{
    const type = cred.type.find((t): t is CredentialType => CREDENTIAL_TYPES_ARRAY.includes(t as CredentialType));
    if(!type) throw Error('No credential type found in credential');
    return type;
  }

private mapSchemaValues(
  schema: TemplateSchema,
  credential: LEARCredential
): MappedTemplateSchema {
  const mapFields = (fields: DetailsField[]): MappedDetailsField[] =>
    fields.map(field => this.mapField(field, credential));

  const mainMapped = mapFields(schema.main);

  const sideMapped = mapFields(schema.side)
    .filter(field => this.shouldIncludeSideField(field));

  return {
    main: mainMapped,
    side: sideMapped
  };
}

  private mapField(
  field: DetailsField,
  credential: LEARCredential
): MappedDetailsField {
  const mapCustom = (custom: CustomDetailsField) => ({
    ...custom,
    value: this.safeCompute(custom.value, credential, custom.token.toString())
  });
  

  if (field.type === 'key-value') {
    const kv = field;
    const ob = {
      ...kv,
      value: this.safeCompute(kv.value, credential, kv.key),
      custom: kv.custom ? mapCustom(kv.custom) : undefined
    };
    return ob;
  }


  const rawGroup = field.value;
  let children: DetailsField[];
  try {
    children = typeof rawGroup === 'function'
      ? rawGroup(credential)
      : rawGroup;
  } catch (e) {
    console.warn(`Error mapping group "${field.key}":`, e);
    children = [];
  }

  return {
    ...field,
    value: children.map(child => this.mapField(child, credential)),
    custom: field.custom ? mapCustom(field.custom) : undefined
  };
}

  private safeCompute<T>(
    raw: T | ((c: LEARCredential) => T),
    credential: LEARCredential,
    fieldKey?: string
  ): T | null {
    try {
      const val = typeof raw === 'function'
        ? (raw as (c: LEARCredential) => T)(credential)
        : raw;
      return val || null;
    } catch (e) {
      const keyPart = fieldKey ? ' "' + fieldKey + '"' : '';
      console.warn(`Error when mapping${keyPart}:`, e);
      return null;
    }
  }

  private shouldIncludeSideField(field: MappedDetailsField): boolean {
  if (field.key !== 'issuer') {
    return true;
  }

  if (field.type === 'key-value') {
    return field.value !== null;
  }

  const children = Array.isArray(field.value)
    ? field.value
    : [];

  const allChildrenNull = children.every(child => {
    if (child.type === 'key-value') {
      return child.value === null;
    }
    return true;
  });

  return !allChildrenNull;
}

  // add "portal" prop to fields
  private extendFields(fields: MappedDetailsField[], injector: Injector): MappedExtendedDetailsField[] {
      return fields.map((field) => {
        let extended: MappedExtendedDetailsField = { ...field };
  
        if (field.custom) {
          const childInjector = Injector.create({
            parent: injector,
            providers: [
              { provide: field.custom.token, useValue: field.custom.value }
            ]
          });
  
          extended.portal = new ComponentPortal(
            field.custom.component,
            null,
            childInjector
          );
        }
  
        if (field.type === 'group') {
          const groupField = field;
          extended = { ...extended } as MappedExtendedDetailsGroupField;
          extended.value = this.extendFields(groupField.value, injector);
        }
  
        return extended;
      });
    }

  private setTemplateModels(schema: MappedTemplateSchema, injector: Injector){
    const extendedMainSchema = this.extendFields(schema.main, injector);
    const extendedSideSchema = this.extendFields(schema.side, injector);
    
    this.mainTemplateModel$.set(extendedMainSchema);
    this.sideTemplateModel$.set(extendedSideSchema);     
  }

}
