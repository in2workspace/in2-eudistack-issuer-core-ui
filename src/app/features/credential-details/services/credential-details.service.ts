import { mockCredentialCertification, mockCredentialMachine } from './../../../core/mocks/details-mocks';
import { inject, Injectable, Injector, signal, WritableSignal } from '@angular/core';
import { EMPTY, from, Observable, of, switchMap, tap } from 'rxjs';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DialogData } from 'src/app/shared/components/dialog/dialog.component';
import { CredentialStatus, LEARCredential, LEARCredentialDataDetails } from 'src/app/core/models/entity/lear-credential';
import { ComponentPortal } from '@angular/cdk/portal';
import { mockCredentialEmployee, mockGxLabel } from 'src/app/core/mocks/details-mocks';
import { DetailsCredentialType, MappedExtendedDetailsField, TemplateSchema, LearCredentialEmployeeDetailsTemplateSchema, LearCredentialMachineDetailsTemplateSchema, VerifiableCertificationDetailsTemplateSchema, GxLabelCredentialDetailsTemplateSchema, MappedTemplateSchema, DetailsField, MappedDetailsField, CustomDetailsField, DetailsKeyValueField, DetailsGroupField, MappedDetailsGroupField, MappedExtendedDetailsGroupField } from 'src/app/core/models/schemas/credential-details-schemas';

@Injectable() //provided in component
export class CredentialDetailsService {
  public credentialValidFrom$ = signal('');
  public credentialValidUntil$ = signal('');
  public credentialType$ = signal<DetailsCredentialType | undefined>(undefined);
  public procedureId$ = signal<string>('');
  public credentialStatus$ = signal<CredentialStatus | undefined>(undefined);

  public sideTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined> = signal(undefined);
  public mainTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined> = signal(undefined);

  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly schemasByTypeMap: Record<DetailsCredentialType, TemplateSchema> = {
    'LEARCredentialEmployee': LearCredentialEmployeeDetailsTemplateSchema,
    'LEARCredentialMachine': LearCredentialMachineDetailsTemplateSchema,
    'VerifiableCertification': VerifiableCertificationDetailsTemplateSchema,
    'GxLabelCredential': GxLabelCredentialDetailsTemplateSchema,
  } as const;

  public setProcedureId(id: string) {
    this.procedureId$.set(id);
  }

  public loadCredentialModels(injector: Injector): void {  
    this.loadCredentailDetails().subscribe(data => {
          const vc = data.credential.vc;
          this.setCredentialBasicInfo(data);

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

  private loadCredentailDetails(): Observable<LEARCredentialDataDetails> {
    // todo restore
    // return this.credentialProcedureService.getCredentialProcedureById(this.procedureId$());
    return of(mockCredentialEmployee);
      // return of(mockGxLabel);
  }

  private getSchemaByType(credType: DetailsCredentialType): TemplateSchema{
    return this.schemasByTypeMap[credType];
  }
      
  private getCredentialType(cred: LEARCredential): DetailsCredentialType{
    const type = cred.type.find((t): t is DetailsCredentialType => t in this.schemasByTypeMap);
    if(!type) throw Error('No credential tyep found in credential');
    return type;
  }

  //todo review
private mapSchemaValues(
  schema: TemplateSchema,
  credential: LEARCredential
): MappedTemplateSchema {
  const mapFieldsMain = (fields: DetailsField[]): MappedDetailsField[] =>
    fields.map(field => this.mapFieldMain(field, credential));

  const mapFieldsSide = (fields: DetailsField[]): MappedDetailsField[] =>
    fields
      .map(field => this.mapFieldNullable(field, credential))
      .filter((f): f is MappedDetailsField => f !== null);

  return {
    main: mapFieldsMain(schema.main),
    side: mapFieldsSide(schema.side)
  };
}

private mapFieldMain(
  field: DetailsField,
  credential: LEARCredential
): MappedDetailsField {
  const mapCustom = (custom: CustomDetailsField): CustomDetailsField => {
    const rawVal = custom.value;
    const computedVal =
      typeof rawVal === 'function' ? rawVal(credential) : rawVal;
    return { ...custom, value: computedVal ?? "" };
  };

  if (field.type === 'key-value') {
    const kv = field as DetailsKeyValueField;
    const raw = kv.value;
    const computed =
      typeof raw === 'function' ? raw(credential) : raw;
    return {
      ...kv,
      value: computed ?? "",
      custom: kv.custom ? mapCustom(kv.custom) : undefined
    };
  }

  // grup
  const grp = field as DetailsGroupField;
  const rawGroup = grp.value;
  const children: DetailsField[] =
    typeof rawGroup === 'function'
      ? rawGroup(credential)
      : rawGroup;

  const mappedChildren = children.map(sub =>
    this.mapFieldMain(sub, credential)
  );

  return {
    ...grp,
    value: mappedChildren,
    custom: grp.custom ? mapCustom(grp.custom) : undefined
  };
}


private mapFieldNullable(
  field: DetailsField,
  credential: LEARCredential
): MappedDetailsField | null {
  const mapCustom = (custom: CustomDetailsField): CustomDetailsField | null => {
    const rawVal = custom.value;
    const computedVal =
      typeof rawVal === 'function' ? rawVal(credential) : rawVal;
    if (!computedVal) {
      console.warn('Omitting side field custom value:');
      console.warn(field);
      return null;
    }
    return { ...custom, value: computedVal };
  };

  if (field.type === 'key-value') {
    const kv = field as DetailsKeyValueField;
    const raw = kv.value;
    const computed =
      typeof raw === 'function' ? raw(credential) : raw;
     if (!computed) {
      console.warn('Omitting side field value:');
      console.warn(field);
      return null;
    }
    const custom = kv.custom ? mapCustom(kv.custom) : null;
    return {
      ...kv,
      value: computed,
      custom: custom ?? undefined
    };
  }

  const grp = field as DetailsGroupField;
  const rawGroup = grp.value;
  const children: DetailsField[] =
    typeof rawGroup === 'function'
      ? rawGroup(credential)
      : rawGroup;
  if (!children?.length){
    console.warn('Ometting empty group:');
    console.warn(grp);
    return null;
  }

  const mappedChildren = children
    .map(sub => this.mapFieldNullable(sub, credential))
    .filter((c): c is MappedDetailsField => c !== null);

  if (!mappedChildren.length){
    console.warn('Ometting empty group:');
    console.warn(grp);
    return null;
  }
  const custom = grp.custom ? mapCustom(grp.custom) : null;

  return {
    ...grp,
    value: mappedChildren,
    custom: custom ?? undefined
  };
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
          const groupField = field as MappedDetailsGroupField;
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
