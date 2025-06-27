import { DetailsCredentialType } from "./lear-credential-details";

export interface LEARCredentialDataDetails {
  procedure_id: string;
  credential_status: CredentialStatus;
  credential: LEARCredentialJwtPayload;
}

export type CredentialStatus = 'WITHDRAWN' | 'VALID' | 'EXPIRED' | 'PEND_DOWNLOAD' | 'PEND_SIGNATURE' | 'DRAFT' | 'ISSUED';

export interface LEARCredentialJwtPayload {
  sub: string | null;
  nbf: string;
  iss: string;
  exp: string;
  iat: string;
  vc: LEARCredential;
  jti: string;
}

export type CredentialType =   'LEARCredentialEmployee' | 'LEARCredentialMachine' | 'VerifiableCertification' | 'GxLabelCredential';
export type ExtendedCredentialType =  'VerifiableCredential' | DetailsCredentialType;

export type LEARCredential =
  | LEARCredentialEmployee
  | LEARCredentialMachine
  | VerifiableCertification
  | GxLabelCredential;

// --- Common Types ---
export interface LifeSpan {
  start: string;
  end: string;
}

export interface CommonMandator {
  commonName: string;
  country: string;
  emailAddress: string;
  organization: string;
  organizationIdentifier: string;
  serialNumber: string;
}

export interface StrictPower {
  id?: string;
  action: TmfAction[] | TmfAction;
  domain: string;
  function: TmfFunction;
  type: string;
}

//less strict version, admits any function and action
export interface Power {
  id?: string;
  action: string[] | string;
  domain: string;
  function: string;
  type: string;
}


export type TmfFunction = 'Onboarding' | 'ProductOffering' | 'Certification' | 'CredentialIssuer' | 'Login';
export type TmfAction = 'Execute' | 'Create' | 'Update' | 'Delete' | 'Upload' | 'Attest' | 'Configure' | 'oidc_m2m'


export interface CommonSigner {
  commonName: string;
  country: string;
  emailAddress: string;
  organization: string;
  organizationIdentifier: string;
  serialNumber: string;
}

export interface CommonIssuer {
  id?: string;
  organizationIdentifier: string;
  organization: string;
  country: string;
  commonName: string;
  emailAddress: string;
  serialNumber: string;
}

// --- Employee ---
export interface LEARCredentialEmployee {
  id: string;
  type: ExtendedCredentialType[];
  description: string;
  credentialSubject: {
    mandate: {
      id: string;
      life_span: LifeSpan;
      mandatee: EmployeeMandatee;
      mandator: EmployeeMandator;
      power: Power[];
      signer: EmployeeSigner;
    };
  };
  issuer?: EmployeeIssuer;
  validFrom: string;
  validUntil: string;
  issuanceDate?: string;
  expirationDate?: string;
}

export interface EmployeeMandatee {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile_phone?: string;
  nationality: string;
}
export interface EmployeeMandator extends CommonMandator {}
export interface EmployeeSigner extends CommonSigner {}
export interface EmployeeIssuer extends CommonIssuer {}

// --- Machine ---
export interface LEARCredentialMachine {
  id: string;
  type: ExtendedCredentialType[];
  description: string;
  credentialSubject: {
    mandate: {
      id: string;
      life_span: LifeSpan;
      mandatee: MachineMandatee;
      mandator: MachineMandator;
      power: Power[];
      signer: MachineSigner;
    };
  };
  issuer?: MachineIssuer;
  validFrom: string;
  validUntil: string;
}

export interface MachineMandatee {
  id: string;
  serviceName: string;
  serviceType: string;
  version: string;
  domain: string;
  ipAddress: string;
  description: string;
  contact: {
    email: string;
    phone: string;
  };
}

export interface MachineMandator extends CommonMandator {}
export interface MachineSigner extends CommonSigner {}
export interface MachineIssuer extends CommonIssuer {}

// --- Certification ---
export interface VerifiableCertification {
  id: string;
  type: ExtendedCredentialType[];
  issuer?: CertificationIssuer;
  credentialSubject: {
    company: {
      address: string;
      commonName: string;
      country: string;
      email: string;
      id: string;
      organization: string;
    };
    compliance: ComplianceEntry[];
    product: {
      productId: string;
      productName: string;
      productVersion: string;
    };
  };
  validFrom: string;
  attester: Attester;
  validUntil: string;
  signer: CertificationSigner;
}

export interface CertificationIssuer {
  commonName: string;
  country: string;
  id: string;
  organization: string;
}

export interface CertificationSigner {
  commonName: string;
  country: string;
  emailAddress: string;
  organization: string;
  organizationIdentifier: string;
  serialNumber: string;
}

export interface Attester {
  id: string;
  organization: string;
  organizationIdentifier: string;
  firstName: string;
  lastName: string;
  country: string;
}

export interface ComplianceEntry {
      id: string;
      hash: string;
      scope: string;
      standard: string;
    }

export interface GxLabelCredential {
  id: string;
  type: ExtendedCredentialType[];
  issuer?: string; //did:elsi:VAT...
  validFrom: string;
  validUntil: string;
  credentialSubject: {
    id: string, //urn...
    "gx:labelLevel": string,
    "gx:engineVersion": string,
    "gx:rulesVersion": string,
    "gx:compliantCredentials": CompliantCredential[],
    "gx:validatedCriteria": string[]
  };
}

export interface CompliantCredential{
  id: string, //urn:...
  type: string, 
  "gx:digestSRI": string
}

export type LearCredentialEmployeeFormData = {
  issuer?: EmployeeIssuer;
  mandatee: LEARCredentialEmployee['credentialSubject']['mandate']['mandatee'];
  mandator: EmployeeMandator;
  power: Power[];
};

export type LearCredentialMachineFormData = {
  issuer?: MachineIssuer;
  mandatee: LEARCredentialMachine['credentialSubject']['mandate']['mandatee'];
  mandator: MachineMandator;
  power: Power[];
};

export type VerifiableCertificationFormData = {
  issuer: CertificationIssuer;
  company: VerifiableCertification['credentialSubject']['company'];
  product: VerifiableCertification['credentialSubject']['product'];
  attester: VerifiableCertification['attester'];
};

export type GxLabelCredentialFormData = {
  issuer: string,
  basic: {
    id:GxLabelCredential['credentialSubject']['id']
    labelLevel: GxLabelCredential['credentialSubject']['gx:labelLevel'],
    engineVersion: GxLabelCredential['credentialSubject']['gx:engineVersion'],
    rulesVersion: GxLabelCredential['credentialSubject']['gx:rulesVersion']
  }
}

export type CredentialFormDataByType = {
  LEARCredentialEmployee: LearCredentialEmployeeFormData;
  LEARCredentialMachine: LearCredentialMachineFormData;
  VerifiableCertification: VerifiableCertificationFormData;
  GxLabelCredential: GxLabelCredentialFormData;
};

export type CredentialFormData<T extends CredentialType = CredentialType> = CredentialFormDataByType[T];
