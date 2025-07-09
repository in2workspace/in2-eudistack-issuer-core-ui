import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Observer, take, tap } from 'rxjs';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { buildFormFromSchema, FormSchemaByType, getFormDataByType, getFormSchemaByType } from '../utils/credential-details-utils';
import { CredentialStatus, CredentialStatusJson, CredentialType, LEARCredential, LEARCredentialDataDetails } from 'src/app/core/models/entity/lear-credential';
import { CredentialDetailsFormSchema } from 'src/app/core/models/entity/lear-credential-details-schemas';
import { CredentialActionsService } from './credential-actions.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';

@Injectable() //provided in component
export class CredentialDetailsService {
  public credentialValidFrom$ = signal('');
  public credentialValidUntil$ = signal('');
  public credentialType$ = signal<CredentialType | undefined>(undefined);
  public credentialDetailsData$ = signal<LEARCredentialDataDetails | undefined>(undefined);
  public credentialDetailsForm$ = signal<FormGroup | undefined>(undefined);
  public credentialDetailsFormSchema$ = signal<CredentialDetailsFormSchema | undefined>(undefined);
  public procedureId$ = signal<string>('');
  public credentialStatus$ = signal<CredentialStatus | undefined>(undefined);
  public credentialStatusJson$ = signal<CredentialStatusJson | undefined>(undefined);

  private readonly actionsService = inject(CredentialActionsService);
  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(DialogWrapperService);

  private readonly loadFormObserver: Observer<LEARCredentialDataDetails> = {
    next: () => {
      this.loadForm();
    },
    error: (err: Error) => {
      console.error('Error loading credential detail', err);
    },
    complete: () => {}
  }

  public setProcedureId(id: string) {
    this.procedureId$.set(id);
  }

  public loadCredentialDetailsAndForm(): void {  
    this.loadCredentialDetails()
      .subscribe(this.loadFormObserver);
  }

  public openSendReminderDialog(): void{
    const procedureId = this.getProcedureId();
    return this.actionsService.openSendReminderDialog(procedureId);
  }
  public openSignCredentialDialog(): void{
    const procedureId = this.getProcedureId();
    return this.actionsService.openSignCredentialDialog(procedureId);
  }
  public openRevokeCredentialDialog(): void{
    const credentialId = this.getCredentialId();
    if(!credentialId){
      console.error("Couldn't get credential id from vc.");
      // todo
      this.dialog.openErrorInfoDialog('error.unknown_error');
      return;
    }
    const listId = this.getCredentialListId();
    if(!listId){
      console.error("Couldn't get credential list from vc.");
      // todo
      this.dialog.openErrorInfoDialog('error.unknown_error');
      return;
    }
    return this.actionsService.openRevokeCredentialDialog(credentialId, listId);
  }

  private getProcedureId(): string{
    return this.procedureId$();
  }

  private getCredential(): LEARCredential | undefined{
    return this.credentialDetailsData$()?.credential.vc;
  }

  private getCredentialId(): string | undefined {
    return this.getCredential()?.id;
  }

  private getCredentialListId(): string {
    const statusListCredential = this.getCredential()?.credentialStatus.statusListCredential;
    
    if(!statusListCredential){
      console.error('No Status List Credential found in vc: ');
      console.error(this.getCredential());
      return "";
    }
    
    const id = statusListCredential[statusListCredential.length - 1];
    return id;
  }

  private loadCredentialDetails(): Observable<LEARCredentialDataDetails> {
    return this.credentialProcedureService
    .getCredentialProcedureById(this.procedureId$())
    // return of(mockCredentialEmployee)
      .pipe(
        take(1),
      tap(data=>{
        this.credentialDetailsData$.set(data);
        this.credentialStatus$.set(data.credential_status);
        this.credentialStatusJson$.set(data.credential.vc.credentialStatus);
      }));
  }

  private loadForm(): void {
    const data = this.credentialDetailsData$();
    if (!data){
      console.error('No credential data to load the form.');
      return;
    }

    const credential = data.credential.vc;


    const credentialValidFrom = credential.validFrom;
    this.credentialValidFrom$.set(credentialValidFrom);

    const credentialValidUntil = credential.validUntil;
    this.credentialValidUntil$.set(credentialValidUntil);

    const credentialTypes = credential.type as string[];
    const type = credentialTypes.find((t): t is CredentialType => t in FormSchemaByType);

    if (!type) {
      throw new Error(`No supported credential type found in: ${credentialTypes.join(', ')}`);
    }

    this.credentialType$.set(type);
    
    const schema = getFormSchemaByType(type);

    const formData = getFormDataByType(credential, type);

  
    const builtForm = buildFormFromSchema(this.fb, schema, formData);
    builtForm.disable();

    this.credentialDetailsFormSchema$.set(schema);
    this.credentialDetailsForm$.set(builtForm);

  }




 
}
