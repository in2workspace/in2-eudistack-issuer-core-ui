import { DialogComponent, DialogData } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EMPTY, from, Observable, Observer, switchMap, take, tap } from 'rxjs';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { buildFormFromSchema, FormSchemaByType, getFormDataByType, getFormSchemaByType } from '../utils/credential-details-utils';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CredentialStatus, CredentialType, LEARCredentialDataDetails } from 'src/app/core/models/entity/lear-credential';
import { CredentialDetailsFormSchema } from 'src/app/core/models/entity/lear-credential-details-schemas';

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

  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  public setProcedureId(id: string) {
    this.procedureId$.set(id);
  }

  public loadCredentialDetailsAndForm(): void {  
    this.loadCredentialDetails()
      .subscribe(this.loadFormObserver);
  }

  public loadCredentialDetails(): Observable<LEARCredentialDataDetails> {
    return this.credentialProcedureService
      .getCredentialProcedureById(this.procedureId$())
      .pipe(
        take(1),
      tap(data=>{
        this.credentialDetailsData$.set(data);
        this.credentialStatus$.set(data.credential_status);
      }));
  }

  private readonly loadFormObserver: Observer<LEARCredentialDataDetails> = {
    next: () => {
      this.loadForm();
    },
    error: (err: any) => {
      console.error('Error loading credential detail', err);
    },
    complete: () => {}
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

    this.dialog.openDialogWithCallback(DialogComponent, dialogData, sendReminderAfterConfirm);

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
    
    this.dialog.openDialogWithCallback(DialogComponent, dialogData, signCredentialAfterConfirm);
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
  
        const dialogRef = this.dialog.openDialog(DialogComponent, dialogData);
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
