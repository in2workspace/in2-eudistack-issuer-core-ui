import { computed, inject, Injectable, Injector, Signal, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CredentialStatus, CredentialType, LEARCredential, CredentialProcedureDataDetails, LifeCycleStatus } from 'src/app/core/models/entity/lear-credential';
import { ComponentPortal } from '@angular/cdk/portal';
import { LearCredentialEmployeeDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-employee-details-schema';
import { LearCredentialMachineDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-machine-details-schema';
import { GxLabelCredentialDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/gx-label-credential-details-schema';
import { VerifiableCertificationDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/verifiable-certification-details-schema';
import { MappedExtendedDetailsField, TemplateSchema, MappedTemplateSchema, DetailsField, MappedDetailsField, CustomDetailsField, MappedExtendedDetailsGroupField } from 'src/app/core/models/entity/lear-credential-details';
import { LifeCycleStatusService } from 'src/app/shared/services/life-cycle-status.service';
import { CredentialActionsService } from './credential-actions.service';
import { StatusClass } from 'src/app/core/models/entity/lear-credential-management';

@Injectable() //provided in component
export class CredentialDetailsService {
  public credentialValidFrom$ = signal('');
  public credentialValidUntil$ = signal('');
  public credentialDetailsData$ = signal<CredentialProcedureDataDetails | undefined>(undefined);
  //todo the states below should derive ("computed") from credentialDetailsData
  public credentialType$ = signal<CredentialType | undefined>(undefined);
  public procedureId$ = signal<string>('');
  public lifeCycleStatus$ = signal<LifeCycleStatus | undefined>(undefined);
  public lifeCycleStatusClass$: Signal<StatusClass | undefined>;
  public credentialStatus$ = signal<CredentialStatus | undefined>(undefined);

  public sideTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined> = signal(undefined);
  public mainTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined> = signal(undefined);

  private readonly actionsService = inject(CredentialActionsService);
  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
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
      if(!status) return status;
      return this.statusService.mapStatusToClass(status)
    });
  }

  public setProcedureId(id: string) {
    this.procedureId$.set(id);
  }

  public loadCredentialModels(injector: Injector): void {  
    this.loadCredentialDetails().subscribe(data => {
      this.credentialDetailsData$.set(data);
      this.setCredentialBasicInfo(data);
      const vc = data.credential.vc;

      const type = this.credentialType$();
      if(!type) throw Error('No credential type found in credential.');

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
      this.dialog.openErrorInfoDialog('error.unknown_error');
      return;
    }
    if(!this.credentialStatus$()){
      console.error("Only credentials with statusCredential field can be revoked.");
      this.dialog.openErrorInfoDialog('error.unknown_error');
      return;
    }
    const credentialId = this.getCredentialId();
    if(!credentialId){
      console.error("Couldn't get credential id from vc.");
      this.dialog.openErrorInfoDialog('error.unknown_error');
      return;
    }
    const listId = this.getCredentialListId();
    if(!listId){
      console.error("Couldn't get credential list from vc.");
      this.dialog.openErrorInfoDialog('error.unknown_error');
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

  
  private loadCredentialDetails(): Observable<CredentialProcedureDataDetails> {
    return this.credentialProcedureService.getCredentialProcedureById(this.procedureId$());
  }

  private getSchemaByType(credType: CredentialType): TemplateSchema{
    return this.schemasByTypeMap[credType];
  }
      
  private getCredentialType(cred: LEARCredential): CredentialType{
    const type = cred.type.find((t): t is CredentialType => t in this.schemasByTypeMap);
    if(!type) throw Error('No credential tyep found in credential');
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


  private setCredentialBasicInfo(details: CredentialProcedureDataDetails): void{
    const credential = details.credential.vc;

    const credentialValidFrom = credential.validFrom;
    this.credentialValidFrom$.set(credentialValidFrom);

    const credentialValidUntil = credential.validUntil;
    this.credentialValidUntil$.set(credentialValidUntil);

    const type = this.getCredentialType(credential);
    this.credentialType$.set(type);

    const lifeCycleStatus = details.lifeCycleStatus;
    this.lifeCycleStatus$.set(lifeCycleStatus);

    const credStatus = details.credential.vc.credentialStatus;
    this.credentialStatus$.set(credStatus);

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
