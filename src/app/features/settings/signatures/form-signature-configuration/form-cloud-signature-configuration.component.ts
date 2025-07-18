import { Component, inject, InjectionToken } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {SECRET_INITIAL_VALUE, SECRETS_FIELDS} from '../../models/signature.constants'
import {providersMock} from 'src/app/core/mocks/signature-configuration.mock'
import { CloudProvider } from '../../models/provider.models';
import { SignatureConfigurationResponse , FormMode} from '../../models/signature.models';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ProviderService } from '../../services/provider.service';


export const FORM_MODE = new InjectionToken<FormMode>('FORM_MODE');
export const DATA_CREDENTIAL = new InjectionToken<SignatureConfigurationResponse>('DATA_CREDENTIAL');

@Component({
  selector: 'app-form-cloud-signature-configuration',
  standalone: true,
  imports: [CommonModule,TranslatePipe,
    ReactiveFormsModule,MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule],
  templateUrl: './form-cloud-signature-configuration.component.html',
  styleUrl: './form-cloud-signature-configuration.component.scss'
})
export class FormCloudSignatureConfigurationComponent {
  cloudProviders:CloudProvider[] = providersMock; 
  private readonly fb = inject(FormBuilder);
  readonly formMode = inject(FORM_MODE);
  formDataCredential = inject(DATA_CREDENTIAL,{optional: true});
  showClientSecret:boolean = false;
  showCredentialPassword:boolean = false;
  requiresTOTP:boolean = false;
  showSecret:boolean = false;
  readonly cloudProviderCredential = this.createForm();
  private readonly providerService = inject(ProviderService);
  SECRET:string= 'secret';

  
  constructor() {
    if(this.formMode!='delete') this.getAllProviders();
    if (this.formMode === 'edit'&& this.formDataCredential ) {
      this.patchInitialValues(this.formDataCredential);
    }
    this.configureFormByMode();
  }

  getAllProviders() {
    this.providerService.getAllProvider().subscribe({
      next: (providers) => {
        this.cloudProviders = providers; 
      },
      error: (err) => {
        console.error('Error loading providers', err);
      }
    });
  }


  patchInitialValues(data: SignatureConfigurationResponse): void {
    this.cloudProviderCredential.patchValue({
      cloudProviderId: data.cloudProviderId,
      credentialName: data.credentialName,
      clientId: data.clientId,
      credentialId: data.credentialId,
    });
  
    //When edited, the user cannot see the secret values ​​but can edit them.    
    this.fillSecretFieldsWithPlaceholder();
  }

  private fillSecretFieldsWithPlaceholder(): void {  
    for (const field of SECRETS_FIELDS) {
      this.cloudProviderCredential.get(field)?.setValue(SECRET_INITIAL_VALUE);
    }
  }

  onProviderChange(providerId: string): void {
      this.clearOnFocus(this.SECRET)
      const  cloudProvider = this.cloudProviders.find(provider => provider.id === providerId);
      if(cloudProvider){
        const isSameAsOriginal = this.formMode === 'edit' && providerId === this.formDataCredential?.id;
        this.requiresTOTP = !isSameAsOriginal && cloudProvider.requiresTOTP;
        const secretControl = this.cloudProviderCredential.get(this.SECRET);
        if (secretControl) {
          if (this.requiresTOTP) {
            secretControl.setValidators(Validators.required);
          } else {
            secretControl.clearValidators();
          }
          secretControl.updateValueAndValidity();
        }
      } 
  }

  private configureFormByMode(): void {
    const requiredFieldsByMode: Record<FormMode, string[]> = {
      create: [
        'cloudProviderId',
        'credentialName',
        'clientId',
        'clientSecret',
        'credentialId',
        'credentialPassword',
        'secret',
      ],
      // When edited, secrets can be edited but are not visible, and they are no longer mandatory because they are actually in the vault.
      edit: ['cloudProviderId',
            'credentialName',
            'clientId',
            'credentialId',
            'rationale'],
      delete: ['rationale']
    };

    const requiredFields = requiredFieldsByMode[this.formMode];

    Object.entries(this.cloudProviderCredential.controls).forEach(([key, control]) => {
      const isRequired = requiredFields.includes(key);
      control.setValidators(isRequired ? Validators.required : null);
      control.updateValueAndValidity();
    });
  }


  getFormValue() {
    return this.cloudProviderCredential.value;
  }
  
  isValid() {
    return this.cloudProviderCredential.valid;
  }
  markTouched() {
    this.cloudProviderCredential.markAllAsTouched(); 
  }

  clearOnFocus(fieldName: string): void {
    const control = this.cloudProviderCredential.get(fieldName);
    if (control?.value === SECRET_INITIAL_VALUE) { 
      control.setValue('');
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      cloudProviderId: [''],
      credentialName: [''],
      clientId: [''],
      clientSecret: [''],
      credentialId: [''],
      credentialPassword: [''],
      secret: [''],
      rationale: ['']
    });
  }

}
