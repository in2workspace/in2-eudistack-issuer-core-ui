
import { Routes } from '@angular/router';
import { canDeactivateGuard } from 'src/app/core/guards/can-component-deactivate.guard';
import { CredentialIssuanceComponent } from './components/credential-issuance/credential-issuance.component';

export default [
  {
    path: '',
    component: CredentialIssuanceComponent,
    canDeactivate: [canDeactivateGuard]
  }
] as Routes;
