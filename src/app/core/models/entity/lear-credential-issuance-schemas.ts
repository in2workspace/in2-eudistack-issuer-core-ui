import { validatorsMap } from './lear-credential-issuance-schemas';
// --- Form Schemas ---

import { Validator, ValidatorFn, Validators } from "@angular/forms";

export type CredentialIssuanceFormFieldSchema = {
    type: 'control' | 'group';
    display?: 'main' | 'side'; //should it be displayed in the main space or as a side card?
    fields?: CredentialIssuanceFormSchema; //for 'group'
    validators?: ;
};

export const validatorsMap: Record<string, (a:any)=>ValidatorFn> = {
    "string-max": (m:number)=>Validators.max(m),
};

  
export type CredentialIssuanceFormSchema = Record<string, CredentialIssuanceFormFieldSchema>;
  
const commonMandatorFields: CredentialIssuanceFormSchema = {
  commonName: { type: 'control' },
  emailAddress: { type: 'control' },
  serialNumber: { type: 'control' },
  organization: { type: 'control' },
  organizationIdentifier: { type: 'control' },
  country: { type: 'control' },
};

const commonIssuerFields: CredentialIssuanceFormSchema = { ...commonMandatorFields };

export const LearCredentialEmployeeIssuanceFormSchema: CredentialIssuanceFormSchema = {
    mandatee: {
      type: 'group',
      display: 'main',
      fields: {
        firstName: { type: 'control', validators: ["string-max"] },
        lastName: { type: 'control' },
        email: { type: 'control' },
        nationality: { type: 'control' },
      },
    },
    mandator: {
      type: 'group',
      display: 'side',
      fields: commonMandatorFields,
    },
    issuer: {
      type: 'group',
      display: 'side',
      fields: commonIssuerFields,
    },
    power: {
      type: 'group',
      display: 'main',
      //content will be set dynamically
    },
  };
  
  export const LearCredentialMachineIssuanceFormSchema: CredentialIssuanceFormSchema = {
    mandatee: {
      type: 'group',
      display: 'main',
      fields: {
        id: { type: 'control' },
        serviceName: { type: 'control' },
        serviceType: { type: 'control' },
        version: { type: 'control' },
        domain: { type: 'control' },
        ipAddress: { type: 'control' },
        description: { type: 'control' },
        contact: {
          type: 'group',
          fields: {
            email: { type: 'control' },
            phone: { type: 'control' },
          },
        },
      },
    },
    mandator: {
      type: 'group',
      display: 'side',
      fields: commonMandatorFields,
    },
    issuer: {
      type: 'group',
      display: 'side',
      fields: commonIssuerFields,
    },
    power: {
      type: 'group',
      display: 'main',
      //content will be set dynamically
    },
  };
  
  export const VerifiableCertificationIssuanceFormSchema: CredentialIssuanceFormSchema = {
    attester: {
      type: 'group',
      display: 'side',
      fields: {
        id: { type: 'control' },
        firstName: { type: 'control' },
        lastName: { type: 'control' },
        organization: { type: 'control' },
        organizationIdentifier: { type: 'control' },
        country: { type: 'control' },
      }
    },
    issuer: {
      type: 'group',
      display: 'side',
      fields: {
        commonName: { type: 'control' },
        organization: { type: 'control' },
        country: { type: 'control' },
      },
    },
    company: {
      type: 'group',
      display: 'main',
      fields: {
        id: { type: 'control' },
        commonName: { type: 'control' },
        organization: { type: 'control' },
        country: { type: 'control' },
        email: { type: 'control' },
        address: { type: 'control' },
      },
    },
    product: {
      type: 'group',
      display: 'main',
      fields: {
        productId: { type: 'control' },
        productName: { type: 'control' },
        productVersion: { type: 'control' },
      },
    },
    compliance: {
      type: 'group',
      display: 'main',
      fields: {} //content will be set dynamically
    },
  };
