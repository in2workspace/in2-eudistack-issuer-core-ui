import { Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import{SignaturesComponent} from './signatures/signatures.component'
import { SignatureConfigResolver } from './resolvers/signature-config.resolver';
import { CredentialIssuanceTwoComponent } from '../credential-issuance-two/components/credential-issuance-two/credential-issuance-two.component';

export default [ 
  { path: '', component: SettingsComponent,
    children: [
        { path: 'schemes', component: CredentialIssuanceTwoComponent },
        { path: 'signatures', component: SignaturesComponent,
          resolve: { signatureData: SignatureConfigResolver
        }},
       
      ]
   },
] as Routes;

