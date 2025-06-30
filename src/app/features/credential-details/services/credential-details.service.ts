import { inject, Injectable, Injector, signal, WritableSignal } from '@angular/core';
import { EMPTY, from, Observable, switchMap, tap } from 'rxjs';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DialogData } from 'src/app/shared/components/dialog/dialog.component';
import { CredentialStatus, CredentialType, LEARCredential, LEARCredentialDataDetails } from 'src/app/core/models/entity/lear-credential';
import { ComponentPortal } from '@angular/cdk/portal';
import { LearCredentialEmployeeDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-employee-details-schema';
import { LearCredentialMachineDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-machine-details-schema';
import { GxLabelCredentialDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/gx-label-credential-details-schema';
import { VerifiableCertificationDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/verifiable-certification-details-schema';
import { MappedExtendedDetailsField, TemplateSchema, MappedTemplateSchema, DetailsField, MappedDetailsField, CustomDetailsField, MappedExtendedDetailsGroupField } from 'src/app/core/models/entity/lear-credential-details';

@Injectable() //provided in component
export class CredentialDetailsService {
  public credentialValidFrom$ = signal('');
  public credentialValidUntil$ = signal('');
  public credentialType$ = signal<CredentialType | undefined>(undefined);
  public procedureId$ = signal<string>('');
  public credentialStatus$ = signal<CredentialStatus | undefined>(undefined);

  public sideTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined> = signal(undefined);
  public mainTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined> = signal(undefined);

  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly schemasByTypeMap: Record<CredentialType, TemplateSchema> = {
    'LEARCredentialEmployee': LearCredentialEmployeeDetailsTemplateSchema,
    'LEARCredentialMachine': LearCredentialMachineDetailsTemplateSchema,
    'VerifiableCertification': VerifiableCertificationDetailsTemplateSchema,
    'gx:LabelCredential': GxLabelCredentialDetailsTemplateSchema,
  } as const;

  public setProcedureId(id: string) {
    this.procedureId$.set(id);
  }

  public loadCredentialModels(injector: Injector): void {  
    this.loadCredentialDetails().subscribe(data => {
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
    const dialogData: DialogData = {
      title: this.translate.instant("credentialDetails.sendReminderConfirm.title"),
      message: this.translate.instant("credentialDetails.sendReminderConfirm.message"),
      confirmationType: 'async',
      status: 'default'
    };

    const sendReminderAfterConfirm = (): Observable<boolean> => {
      return this.sendReminder();
    }

    this.dialog.openDialogWithCallback(dialogData, sendReminderAfterConfirm);
  }

  public openSignCredentialDialog(): void {
    const dialogData: DialogData = {
      title: this.translate.instant("credentialDetails.signCredentialConfirm.title"),
      message: this.translate.instant("credentialDetails.signCredentialConfirm.message"),
      confirmationType: 'async',
      status: 'default'
    };

    const signCredentialAfterConfirm = (): Observable<boolean> => {
      return this.signCredential();
    }
    
    this.dialog.openDialogWithCallback(dialogData, signCredentialAfterConfirm);
  }

  
  public sendReminder(): Observable<boolean> {
    return this.executeCredentialAction(
      (procedureId) => this.credentialProcedureService.sendReminder(procedureId),
      "credentialDetails.sendReminderSuccess.title",
      "credentialDetails.sendReminderSuccess.message"
    );
  }
  
  public signCredential(): Observable<boolean> {
    return this.executeCredentialAction(
      (procedureId) => this.credentialProcedureService.signCredential(procedureId),
      "credentialDetails.signCredentialSuccess.title",
      "credentialDetails.signCredentialSuccess.message"
    );
  }

  private loadCredentialDetails(): Observable<LEARCredentialDataDetails> {
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

    return {
      main: mapFields(schema.main),
      side: mapFields(schema.side)
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


  private setCredentialBasicInfo(details: LEARCredentialDataDetails): void{
    const credential = details.credential.vc;

    const credentialValidFrom = credential.validFrom;
    this.credentialValidFrom$.set(credentialValidFrom);

    const credentialValidUntil = credential.validUntil;
    this.credentialValidUntil$.set(credentialValidUntil);

    const type = this.getCredentialType(credential);
    this.credentialType$.set(type);

    const status = details.credential_status;
    this.credentialStatus$.set(status);

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

  private executeCredentialAction(
    action: (procedureId: string) => Observable<void>,
    titleKey: string,
    messageKey: string
  ): Observable<boolean> {
    const procedureId = this.procedureId$();
    if (!procedureId) {
      console.error('No procedure id.');
      return EMPTY;
    }
  
    return action(procedureId).pipe(
      switchMap(() => {
        const dialogData: DialogData = {
          title: this.translate.instant(titleKey),
          message: this.translate.instant(messageKey),
          confirmationType: 'none',
          status: 'default'
        };
  
        const dialogRef = this.dialog.openDialog(dialogData);
        return dialogRef.afterClosed();
      }),
      switchMap(()  =>
        from(this.router.navigate(['/organization/credentials']))
      ),
      tap(() => location.reload())
    );
  }

}
