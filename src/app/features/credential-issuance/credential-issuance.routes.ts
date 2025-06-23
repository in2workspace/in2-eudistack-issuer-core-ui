
import { Routes } from '@angular/router';
import { CredentialIssuanceComponent } from "./credential-issuance.component";
import { CredentialIssuanceTwoComponent } from '../credential-issuance-two/components/credential-issuance-two/credential-issuance-two.component';

export default [
  {
    path: '',
    component: CredentialIssuanceTwoComponent,
  }
] as Routes;
