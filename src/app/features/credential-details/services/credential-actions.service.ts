import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, switchMap, from, tap, EMPTY } from 'rxjs';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { DialogData } from 'src/app/shared/components/dialog/dialog-data';

@Injectable({
  providedIn: 'root'
})
export class CredentialActionsService {

  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  // SEND REMINDER (NOTIFICATION)
  public openSendReminderDialog(procedureId: string): void {
  
    const dialogData: DialogData = {
      title: this.translate.instant("credentialDetails.sendReminderConfirm.title"),
      message: this.translate.instant("credentialDetails.sendReminderConfirm.message"),
      confirmationType: 'async',
      status: 'default'
    };

    const sendReminderAfterConfirm = (): Observable<boolean> => {
      return this.sendReminder(procedureId);
    }

    this.dialog.openDialogWithCallback(DialogComponent, dialogData, sendReminderAfterConfirm);

  }

  // SIGN CREDENTIAL
  public openSignCredentialDialog(procedureId: string): void {

    const dialogData: DialogData = {
      title: this.translate.instant("credentialDetails.signCredentialConfirm.title"),
      message: this.translate.instant("credentialDetails.signCredentialConfirm.message"),
      confirmationType: 'async',
      status: 'default'
    };

    const signCredentialAfterConfirm = (): Observable<boolean> => {
      return this.signCredential(procedureId);
    }
    
    this.dialog.openDialogWithCallback(DialogComponent, dialogData, signCredentialAfterConfirm);
  }

  // REVOKE CREDENTIAL

  public openRevokeCredentialDialog(credentialId: string, credentialList: string): void {

    const dialogData: DialogData = {
      title: this.translate.instant("credentialDetails.revokeCredentialConfirm.title"),
      message: this.translate.instant("credentialDetails.revokeCredentialConfirm.message"),
      confirmationType: 'async',
      status: 'default'
    };

    const revokeCredentialAfterConfirm = (): Observable<boolean> => {
      return this.revokeCredential(credentialId, credentialList);
    }
    
    this.dialog.openDialogWithCallback(DialogComponent, dialogData, revokeCredentialAfterConfirm);
  }

  //executes backend callback by CREDENTIAL ID
  private executeCredentialBackendAction(
    id: string,
    action: (id: string) => Observable<void>,
    titleKey: string,
    messageKey: string
  ): Observable<boolean> {
  
    return action(id).pipe(
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

  private executeActionByProcedureId(
    procedureId: string, 
    action: (id: string) => Observable<void>,
    titleKey: string,
    messageKey: string
  ): Observable<boolean> {
    if (!procedureId) {
      console.error('No procedure id.');
      return EMPTY;
    }
  
    return this.executeCredentialBackendAction(procedureId, action, titleKey, messageKey);
  }

  private executeActionByCredentialId(
    credentialId: string,
    action: (credentialId: string) => Observable<void>,
    titleKey: string,
    messageKey: string
  ): Observable<boolean> {
    if(!credentialId){
      console.error("Couldn't get credential list from credential.");
      return EMPTY;
    }
  
    return this.executeCredentialBackendAction(credentialId, action, titleKey, messageKey);
  }

  private sendReminder(procedureId: string): Observable<boolean> {
    return this.executeActionByProcedureId(
      procedureId,
      (procedureId) => this.credentialProcedureService.sendReminder(procedureId),
      "credentialDetails.sendReminderSuccess.title",
      "credentialDetails.sendReminderSuccess.message"
    );
  }
  
  private signCredential(procedureId: string): Observable<boolean> {
    return this.executeActionByProcedureId(
      procedureId,
      (procedureId) => this.credentialProcedureService.signCredential(procedureId),
      "credentialDetails.signCredentialSuccess.title",
      "credentialDetails.signCredentialSuccess.message"
    );
  }

  private revokeCredential(credentialId: string, credentialList: string): Observable<boolean> {
   
    return this.executeActionByCredentialId(
      credentialId,
      (credentialId) => this.credentialProcedureService.revokeCredential(credentialId, credentialList),
      "credentialDetails.revokeCredentialSuccess.title",
      "credentialDetails.revokeCredentialSuccess.message"
    );
  }
}
