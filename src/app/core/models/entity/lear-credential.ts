export interface CredentialProcedureDataDetails {
  procedure_id: string;
  // In the future, "lifeCycleStatus" will be replaced by "lifecycle_procedure_status"
  lifeCycleStatus: LifeCycleStatus;
  credential: LEARCredentialJwtPayload;
}

export type LifeCycleStatus = 'WITHDRAWN' | 'VALID' | 'EXPIRED' | 'PEND_DOWNLOAD' | 'PEND_SIGNATURE' | 'DRAFT' | 'ISSUED' | 'REVOKED';

export interface CredentialStatus {   
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

export const CREDENTIAL_TYPES_ARRAY = ['LEARCredentialEmployee', 'LEARCredentialMachine', 'VerifiableCertification', 'gx:LabelCredential'] as const;
export type CredentialType = typeof CREDENTIAL_TYPES_ARRAY[number];
export type ExtendedCredentialType =  'VerifiableCredential' | CredentialType;

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
  credentialStatus: CredentialStatus;
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
  credentialStatus: CredentialStatus;
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
  credentialStatus: CredentialStatus;
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
  credentialStatus: CredentialStatus;
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