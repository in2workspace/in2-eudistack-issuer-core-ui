import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment} from 'src/environments/environment';
import { ProcedureResponse } from '../models/dto/procedure-response.dto';
import { CredentialOfferResponse } from '../models/dto/credential-offer-response.dto';
import { LEARCredentialDataDetails } from '../models/entity/lear-credential';
import { DialogWrapperService } from "../../shared/components/dialog/dialog-wrapper/dialog-wrapper.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { API } from "../constants/api.constants";
import { LEARCredentialDataDetailsResponse } from '../models/dto/lear-credential-data-details-response.dto';
import { LEARCredentialDataNormalizer } from 'src/app/features/credential-details/utils/lear-credential-employee-data-normalizer';
import { IssuanceLEARCredentialRequestDto } from '../models/dto/lear-credential-issuance-request.dto';

//todo rename (backend, api... service)
@Injectable({
  providedIn: 'root'
})
export class CredentialProcedureService {

  private readonly saveCredential = `${environment.server_url}${API.SAVE_CREDENTIAL_PATH}`;
  private readonly organizationProcedures = `${environment.server_url}${API.PROCEDURES_PATH}`;
  private readonly credentialOfferUrl = `${environment.server_url}${API.CREDENTIAL_OFFER_PATH}`;
  private readonly notificationProcedure = `${environment.server_url}${API.NOTIFICATION_PATH}`;
  private readonly signCredentialUrl = `${environment.server_url}${API.SIGN_CREDENTIAL_PATH}`;

  private readonly http = inject(HttpClient);
  private readonly normalizer = new LEARCredentialDataNormalizer();
  private readonly dialog = inject(DialogWrapperService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  public getCredentialProcedures(): Observable<ProcedureResponse> {
    return this.http.get<ProcedureResponse>(this.organizationProcedures).pipe(
      catchError(this.handleError)
    );
  }

  public getCredentialProcedureById(procedureId: string): Observable<LEARCredentialDataDetails> {
    return this.http.get<LEARCredentialDataDetailsResponse>(
      `${this.organizationProcedures}/${procedureId}/credential-decoded`
    )
    .pipe(
      map(response => {
        const { credential } = response;
        // If vc exists, we normalize it, otherwise we assume that credential is already of the expected type
        const credentialData = 'vc' in credential
          ? credential.vc
          : credential;

        // Normalize the part which is of type LEARCredentialEmployee
        const normalizedCredential = this.normalizer.normalizeLearCredential(credentialData);

        return {
          ...response,
          credential: {
            ...credential,
            vc: normalizedCredential
          }
        } as LEARCredentialDataDetails;
      }),
      catchError(this.handleError)
    );
  }

  public createProcedure(procedureRequest: IssuanceLEARCredentialRequestDto): Observable<void> {
    console.log('Sending API request to create procedure');
    console.log(procedureRequest);
    return this.http.post<void>(this.saveCredential, procedureRequest).pipe(
      catchError(this.handleError)
    );
  }

  public sendReminder(procedureId: string): Observable<void> {
    return this.http.post<void>(`${this.notificationProcedure}/${procedureId}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  public signCredential(procedureId: string): Observable<void> {
    return this.http.post<void>(`${this.signCredentialUrl}/${procedureId}`, {} ).pipe(
      catchError(this.handleError)
    );
  }

  public getCredentialOfferByTransactionCode(transactionCode: string): Observable<CredentialOfferResponse> {
    console.info('Getting credential offer by transaction code: ' + transactionCode);
    return this.http.get<CredentialOfferResponse>(`${this.credentialOfferUrl}/transaction-code/${transactionCode}`).pipe(
      catchError(this.handleError),
      catchError(this.handleCredentialOfferError)
    );
  }

  public getCredentialOfferByCTransactionCode(cTransactionCode: string): Observable<CredentialOfferResponse> {
    console.info('Refreshing QR code: getting credential offer by c-transaction code: ' + cTransactionCode);
    return this.http.get<CredentialOfferResponse>(`${this.credentialOfferUrl}/c-transaction-code/${cTransactionCode}`).pipe(
      catchError(this.handleError),
      catchError(this.handleCredentialOfferError)
    );
  }

  public redirectToDashboard(): void{
    setTimeout(()=>{
      this.router.navigate(['/organization/credentials']);
    }, 0);
  }

  private readonly handleError = (error: HttpErrorResponse) => {
    let errorDetail: string;
    if (error.error && typeof error.error === 'object' && error.error.message) {
      errorDetail = error.error.message;
    } else if (error.error && typeof error.error === 'string') {
      errorDetail = error.error;
    } else {
      errorDetail = error.message;
    }

    console.log('handleError -> status:', error.status, 'errorDetail:', errorDetail);
    // this 503 error handling is specific to credential-procedure endpoints
    if (error.status === 503 && errorDetail.trim() === 'Error during communication with the mail server') {
      const errorMessage = this.translate.instant('error.serverMailError.message');
      const errorTitle = this.translate.instant('error.serverMailError.title');

      this.dialog.openErrorInfoDialog(errorMessage, errorTitle);
      this.redirectToDashboard();
      return throwError(() => error);
    } else if (error.error instanceof ErrorEvent) {
      console.error(`Client-side error: ${errorDetail}`);
      return throwError(() => error);
    } else {
      const defaultErrorMessage = `Server-side error: ${error.status} ${errorDetail}`;
      console.error('Error response body:', defaultErrorMessage);
      return throwError(() => error);
    }
  }

  private readonly handleCredentialOfferError = (error: HttpErrorResponse): Observable<never> => {
    const errorStatus = error?.status ?? error?.error?.status ?? 0;
    let errorMessage = this.translate.instant("error.credentialOffer.unexpected");
  
    if (errorStatus === 404) {
      errorMessage = this.translate.instant("error.credentialOffer.not-found");
    } else if (errorStatus === 409) {
      errorMessage = this.translate.instant("error.credentialOffer.conflict");
    }
  
    this.dialog.openErrorInfoDialog(DialogComponent, errorMessage);
    setTimeout(()=>{
      this.router.navigate(['/home']);
    }, 0);
    
    return throwError(() => error);
  };
  

}
