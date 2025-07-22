import { Directive, inject, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CredentialIssuanceService } from '../../credential-issuance/services/credential-issuance.service';

// This class is extended by Issuance Form custom children components
@Directive()
export abstract class IssuanceCustomFormChild<T extends AbstractControl = AbstractControl> {
   public readonly data = input<any>(); 
   public readonly form = input.required<T>();
   protected readonly issuance = inject(CredentialIssuanceService);

  protected updateAlertMessages(messages: string[]): void {
    this.issuance.updateAlertMessages(messages);
  }
}