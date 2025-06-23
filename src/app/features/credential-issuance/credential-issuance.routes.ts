
import { Routes } from '@angular/router';
import { CredentialIssuanceTwoComponent } from '../credential-issuance-two/components/credential-issuance-two/credential-issuance-two.component';
import { canDeactivateGuard } from 'src/app/core/guards/can-component-deactivate.guard';

export default [
  {
    path: '',
    component: CredentialIssuanceTwoComponent,
    canDeactivate: [canDeactivateGuard]
  }
] as Routes;
