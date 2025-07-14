export interface LEARCredentialDataDetails {
  procedure_id: string;
  // In the future, "credential_status" will be replaced by "lifecycle_procedure_status"
  credential_status: CredentialStatus;
  credential: LEARCredentialJwtPayload;
}

// WITHDRAWN, PEND_DOWNLOAD and ISSUED are legacy statuses. Some of them will be reused in the future
export type CredentialStatus = 'WITHDRAWN' | 'VALID' | 'EXPIRED' | 'PEND_DOWNLOAD' | 'PEND_SIGNATURE' | 'DRAFT' | 'ISSUED' | 'REVOKED';

// This corresponds to the current credentialStatus field in LEARCredential, which is different from the "credential_status". In the future, "credential_status" will be replaced by "lifecycle_procedure_status"
export interface CredentialStatusJson {   
  "id": string,
  "type": CredentialStatusType,   
  "statusPurpose": CredentialStatusPurpose,   
  "statusListIndex": CredentialStatusListIndex,
  "statusListCredential": string;
} 
export type CredentialStatusType = 'PlainListEntity';
export type CredentialStatusPurpose = 'revocation';
export type CredentialStatusListIndex = '<nonce>';


export interface LEARCredentialJwtPayload {
  sub: string | null;
  nbf: string;
  iss: string;
  exp: string;
  iat: string;
  vc: LEARCredential;
  jti: string;
}

export type CredentialType =   'LEARCredentialEmployee' | 'LEARCredentialMachine' | 'VerifiableCertification';
export type ExtendedCredentialType =  'VerifiableCredential' | 'LEARCredentialEmployee' | 'LEARCredentialMachine' | 'VerifiableCertification';

export type LEARCredential =
  | LEARCredentialEmployee
  | LEARCredentialMachine
  | VerifiableCertification;

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
  issuer: EmployeeIssuer;
  validFrom: string;
  validUntil: string;
  issuanceDate?: string;
  expirationDate?: string;
  credentialStatus: CredentialStatusJson;
}

export interface EmployeeMandatee {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile_phone?: string;
  nationality: string;
};
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
  issuer: MachineIssuer;
  validFrom: string;
  validUntil: string;
  credentialStatus: CredentialStatusJson;
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
};
export interface MachineMandator extends CommonMandator {}
export interface MachineSigner extends CommonSigner {}
export interface MachineIssuer extends CommonIssuer {}

// --- Certification ---
export interface VerifiableCertification {
  id: string;
  type: ExtendedCredentialType[];
  issuer: CertificationIssuer;
  credentialSubject: {
    company: {
      address: string;
      commonName: string;
      country: string;
      email: string;
      id: string;
      organization: string;
    };
    compliance: {
      id: string;
      hash: string;
      scope: string;
      standard: string;
    }[];
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
  credentialStatus: CredentialStatusJson;
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

export type LearCredentialEmployeeFormData = {
  issuer: EmployeeIssuer;
  mandatee: LEARCredentialEmployee['credentialSubject']['mandate']['mandatee'];
  mandator: EmployeeMandator;
  power: Power[];
};

export type LearCredentialMachineFormData = {
  issuer: MachineIssuer;
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

export type CredentialFormDataByType = {
  LEARCredentialEmployee: LearCredentialEmployeeFormData;
  LEARCredentialMachine: LearCredentialMachineFormData;
  VerifiableCertification: VerifiableCertificationFormData;
};

export type CredentialFormData<T extends CredentialType = CredentialType> = CredentialFormDataByType[T];
