import { Directive, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CredentialIssuanceService } from '../../credential-issuance/services/credential-issuance.service';
import { BaseIssuanceCustomFormChild } from './base-issuance-custom-form-child';


@Directive()
export abstract class IssuanceCustomFormChild<T extends AbstractControl = AbstractControl> extends BaseIssuanceCustomFormChild<T> {
  protected readonly issuance = inject(CredentialIssuanceService);

  protected updateAlertMessages(messages: string[]): void {
    this.issuance.updateAlertMessages(messages);
  }
}
