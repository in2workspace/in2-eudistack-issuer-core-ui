import { inject, Injectable, Injector, signal, WritableSignal } from '@angular/core';
import { EMPTY, from, Observable, of, switchMap, tap } from 'rxjs';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DialogData } from 'src/app/shared/components/dialog/dialog.component';
import { CredentialStatus, LEARCredential, LEARCredentialDataDetails } from 'src/app/core/models/entity/lear-credential';
import { ComponentPortal } from '@angular/cdk/portal';
import { mockGxLabel } from 'src/app/core/mocks/details-mocks';
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

  public setProcedureId(id: string) {
    this.procedureId$.set(id);
  }

  public loadCredentialDetails(injector: Injector): void {  
    this.loadDetailsModels().subscribe(data => {
          const vc = data.credential.vc;
          this.setCredentialBasicInfo(data);

          const type = this.credentialType$();
          if(!type) throw Error('No credential type found in credential.');

          const schema = this.getSchemaByType(type);
          const mappedSchema = this.mapSchemaValues(schema, vc);
          const mappedSideSchema = mappedSchema.side;
          const mappedMainSchema = mappedSchema.main;
          const processedSideSchema = this.processFields(mappedSideSchema, injector);
          const processedMainSchema = this.processFields(mappedMainSchema, injector);
          
          this.mainTemplateModel$.set(processedMainSchema);
          this.sideTemplateModel$.set(processedSideSchema);      
      });
  }

  public loadDetailsModels(): Observable<LEARCredentialDataDetails> {
    // todo restore
    // return this.credentialProcedureService.getCredentialProcedureById(this.procedureId$())
    // return of(mockCredentialEmployee).pipe(take(1));
      return of(mockGxLabel);
  }

    public getSchemaByType(credType: DetailsCredentialType): TemplateSchema{
      return this.schemasByTypeMap[credType];
    }

    private schemasByTypeMap: Record<DetailsCredentialType, TemplateSchema> = {
      'LearCredentialEmployee': LearCredentialEmployeeDetailsTemplateSchema,
      'LearCredentialMachine': LearCredentialMachineDetailsTemplateSchema,
      'VerifiableCertification': VerifiableCertificationDetailsTemplateSchema,
      'GxLabelCredential': GxLabelCredentialDetailsTemplateSchema,
    } as const;
      
  private getCredentialType(cred: LEARCredential): DetailsCredentialType{
    const type = cred.type.find((t): t is DetailsCredentialType => t in this.schemasByTypeMap);
    if(!type) throw Error('No credential tyep found in credential');
    return type;
  }

  public mapSchemaValues(
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
      // Helper per processar .custom si existeix
      const mapCustom = (custom: CustomDetailsField): CustomDetailsField => {
        const rawVal = custom.value;
        const computedVal = typeof rawVal === 'function'
          ? rawVal(credential)
          : rawVal;
        return { ...custom, value: computedVal };
      };
  
      // 1) Si és key-value, mapegem el .value i (si hi ha) el .custom
      if (field.type === 'key-value') {
        const kv = field as DetailsKeyValueField;
        const raw = kv.value;
        const computed = typeof raw === 'function'
          ? raw(credential)
          : raw;
  
        return {
          ...kv,
          value: computed,
          custom: kv.custom ? mapCustom(kv.custom) : undefined
        };
      }
  
      // 2) Si és group, primer normalitzem el .value a DetailsField[]
      const grp = field as DetailsGroupField;
      const rawGroup = grp.value;
      const children: DetailsField[] =
        typeof rawGroup === 'function'
          ? rawGroup(credential)
          : rawGroup;
  
      // 3) Recorrem recursivament els sub-camps
      const mappedChildren = children.map((sub: DetailsField) =>
        this.mapField(sub, credential)
      );
  
      // 4) I tornem a construir el grup, mapejant custom si cal
      return {
        ...grp,
        value: mappedChildren,
        custom: grp.custom ? mapCustom(grp.custom) : undefined
      };
    }

  public setCredentialBasicInfo(details: LEARCredentialDataDetails): void{
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

  private processFields(fields: MappedDetailsField[], injector: Injector): MappedExtendedDetailsField[] {
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
          extended.value = this.processFields(groupField.value, injector);
        }
  
        return extended;
      });
    }


  //SEND REMINDER AND SIGN
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
}
