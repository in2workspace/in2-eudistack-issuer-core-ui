import { CredentialProcedureDetails, CredentialStatus, EmployeeMandator } from "../models/entity/lear-credential";

export const mandatorMock: EmployeeMandator = {
  id: 'id',
  commonName: "name surname",
  country: "FR",
  email: "email@domain.com",
  organization: "Org Name",
  organizationIdentifier: "ORG_ID",
  serialNumber: "SERIAL-NUMBER-01",
}

export const mockCredentialStatus: CredentialStatus = {   
  id: "https://issuer.dome-marketplace.eu/credentials/status/1#<nonce>",
  type: "PlainListEntity",   
  statusPurpose: "revocation",   
  statusListIndex: "<nonce>",
  statusListCredential: "https://issuer.dome-marketplace.eu/credentials/status/1" 
} 

export const mockCredentialEmployee: any = {
// todo export const mockCredentialEmployee: CredentialProcedureDetails = {
  procedure_id: 'mock-procedure-employee',
  lifeCycleStatus: 'DRAFT',
  subjectEmail: "mock@email.com",
  credential: {
    sub: null,
    nbf: '1714675200',
    iss: 'issuer-emp',
    exp: '1735689600',
    iat: '1714675200',
    jti: 'jti-emp-123',
    vc: {
      id: 'cred-emp-id',
      type: ['LEARCredentialEmployee'],
      description: 'Mock employee credential',
      credentialStatus: {
        ...mockCredentialStatus
      },
      issuer: {
        id: 'issuer-emp',
        commonName: 'Employee Issuer',
        country: 'ES',
        organization: 'Org EMP',
        organizationIdentifier: 'IDentifier Org',
        serialNumber: 'SERIAL-NUMBER'
      },
      credentialSubject: {
        mandate: {
          id: 'mandate-emp',
          life_span: { start: '2024-01-01', end: '2025-01-01' },
          mandatee: {
            id: 'emp-1',
            email: 'emp@example.com',
            firstName: 'Emp',
            lastName: 'Loyee',
            mobile_phone: '+34000000000',
            nationality: 'ES'
          },
          mandator: {
            commonName: 'Mandator EMP',
            country: 'ES',
            emailAddress: 'mandator@emp.com',
            organization: 'Org Mandator',
            organizationIdentifier: 'ORG-MAN-EMP',
            serialNumber: 'SN-EMP'
          },
          power: [
            { id: 'p1', action: ['Execute'], domain: 'DOME', function: 'Onboarding', type: 'Domain' },
            { id: 'p2', action: ['Update'], domain: 'DOME', function: 'ProductOffering', type: 'Domain' },
            { id: 'p3', action: ['Reload'], domain: 'DOME', function: 'ProductOffering', type: 'Domain' },
            { id: 'p3', action: ['Delete'], domain: 'DOME', function: 'ProductOffering', type: 'Domain' }
          ],
          signer: {
            commonName: 'Signer EMP',
            country: 'ES',
            emailAddress: 'signer@emp.com',
            organization: 'SignerOrg',
            organizationIdentifier: 'SIGN-EMP',
            serialNumber: 'SN-SIGN-EMP'
          }
        }
      },
      validFrom: '2023-08-22T00:00:00Z',
      validUntil: '2024-01-01T08:00:00.000Z',
    }
  }
};

export const mockCredentialMachine: any = {
// todo export const mockCredentialMachine: CredentialProcedureDetails = {
  procedure_id: 'mock-procedure-machine',
  lifeCycleStatus: 'PEND_SIGNATURE',
  subjectEmail: "mock@email.com",
  credential: {
    sub: null,
    nbf: '1714675200',
    iss: 'issuer-mac',
    exp: '1735689600',
    iat: '1714675200',
    jti: 'jti-mac-123',
    vc: {
      id: 'cred-machine-id',
      type: ['LEARCredentialMachine'],
      description: 'Mock machine credential',
      credentialStatus: {
        ...mockCredentialStatus
      },
      issuer: {
        id: 'issuer-mac',
        commonName: 'Machine Issuer',
        country: 'DE',
        organization: 'Org MAC',
        organizationIdentifier: 'IDentifier Org',
        emailAddress: 'email',
        serialNumber: 'SERIAL-NUMBER'
      },
      credentialSubject: {
        mandate: {
          id: 'mandate-mac',
          life_span: { start: '2024-01-01', end: '2025-01-01' },
          mandatee: {
            id: 'machine-1',
            domain: 'cloud',
            ipAddress: '192.168.0.1',
          },
          mandator: {
            commonName: 'Mandator MAC',
            country: 'DE',
            email: 'mandator@mac.com',
            organization: 'Org Mandator MAC',
            organizationIdentifier: 'VATES-999999',
            id: 'ORG-MAN-MAC',
            serialNumber: 'SN-MAC'
          },
          power: [
            { id: 'p2', action: ['Execute'], domain: 'infra', function: 'Onboarding', type: 'perm' }
          ],
          signer: {
            commonName: 'Signer MAC',
            country: 'DE',
            emailAddress: 'signer@mac.com',
            organization: 'SignerOrgMac',
            organizationIdentifier: 'SIGN-MAC',
            serialNumber: 'SN-SIGN-MAC'
          }
        }
      },
      validFrom: '2024-01-01',
      validUntil: '2025-01-01'
    }
  }
};

export const mockCredentialCertification: any = {
// todo xport const mockCredentialCertification: CredentialProcedureDetails = {
  procedure_id: 'mock-procedure-cert',
  lifeCycleStatus: 'PEND_DOWNLOAD',
  subjectEmail: "mock@email.com",
  credential: {
    sub: null,
    nbf: '1714675200',
    iss: 'issuer-cert',
    exp: '1735689600',
    iat: '1714675200',
    jti: 'jti-cert-123',
    vc: {
      id: 'cred-certification-id',
      type: ['VerifiableCertification'],
      credentialStatus: {
        ...mockCredentialStatus
      },
      issuer: {
        id: 'issuer-cert',
        commonName: 'Cert Issuer',
        country: 'FR',
        organization: 'Org CERT',
        emailAddress: 'aa@email.test',
        organizationIdentifier: 'org-id',
        serialNumber: 'aaa',
      },
      credentialSubject: {
        company: {
          id: 'company-1',
          commonName: 'Test Company',
          organization: 'Test Org',
          country: 'FR',
          email: 'info@company.com',
          address: '123 Rue Example'
        },
        compliance: [
          {
            id: 'comp1',
            hash: 'abc123',
            scope: 'full',
            standard: 'ISO9001'
          },
          {
            id: 'comp2',
            hash: 'fdsafda',
            scope: 'fullaaa',
            standard: 'ISO666666'
          }
        ],
        product: {
          productId: 'prod-1',
          productName: 'SuperWidget',
          productVersion: '2.3'
        }
      },
      attester: {
        id: 'tester-1',
        organization: 'AuditCo',
        organizationIdentifier: 'AUD123',
        firstName: 'Audrey',
        lastName: 'Test',
        country: 'FR'
      },
      validFrom: '2024-01-01',
      validUntil: '2025-01-01',
      signer: {
        commonName: 'Signer CERT',
        country: 'FR',
        emailAddress: 'signer@cert.com',
        organization: 'SignerCertOrg',
        organizationIdentifier: 'SIGN-CERT',
        serialNumber: 'SN-CERT-123'
      }
    }
  }
};


export const mockGxLabel: CredentialProcedureDetails = {
  procedure_id: 'mock-procedure-gx-label',
  lifeCycleStatus: 'DRAFT',
  subjectEmail: "mock@email.com",
  credential: {
    sub: null,
    nbf: '1714675200',
    iss: 'issuer-cert',
    exp: '1735689600',
    iat: '1714675200',
    jti: 'jti-cert-123',
    vc: {
      id: 'cred-cert',
      type: ['VerifiableCredential', 'gx:LabelCredential'],
            credentialStatus: {
        ...mockCredentialStatus
      },
      issuer: "issueeeeeeer",
 credentialSubject: {
        id: 'urn:uuid:123e4567-e89b-12d3-a456-426614174000',
        "gx:labelLevel": "",
        "gx:engineVersion": "2.1.0",
        "gx:rulesVersion": "2025-06-01",
        "gx:compliantCredentials": [
          {
            id: 'urn:uuid:223e4567-e89b-12d3-a456-426614174001',
            type: 'Employee Credential A',
            "gx:digestSRI": 'did:elsi:EMP-ORG1',
          },
          {
            id: 'urn:uuid:aaae4567-e89b-12d3-a456-426614174001',
            type: 'Employee Credential B',
            "gx:digestSRI": 'did:elsi:EMP-ORG2',
          },
          {
            id: 'urn:uuid:bbbe4567-e89b-12d3-a456-426614174001',
            type: 'Employee Credential C',
            "gx:digestSRI": 'did:elsi:EMP-ORG3',
          },
          {
            id: 'urn:uuid:bbbe4567-e89b-12d3-a456-426614174001',
            type: 'Employee Credential C',
            "gx:digestSRI": 'did:elsi:EMP-ORG3',
          },
          {
            id: 'urn:uuid:bbbe4567-e89b-12d3-a456-426614174001',
            type: 'Employee Credential C',
            "gx:digestSRI": 'did:elsi:EMP-ORG3',
          },
          {
            id: 'urn:uuid:bbbe4567-e89b-12d3-a456-426614174001',
            type: 'Employee Credential C',
            "gx:digestSRI": 'did:elsi:EMP-ORG3',
          },
          {
            id: 'urn:uuid:bbbe4567-e89b-12d3-a456-426614174001',
            type: 'Employee Credential C',
            "gx:digestSRI": 'did:elsi:EMP-ORG3',
          },
        ],
        "gx:validatedCriteria": [
          'https://w3id.org/gaia-x/specs/cd25.04/criterion/P1.2.5',
          'https://w3id.org/gaia-x/specs/cd25.03/criterion/P1.2.4',
          'https://w3id.org/gaia-x/specs/cd25.01/criterion/P1.2.3'
        ]
      },
      validFrom: '2024-01-01',
      validUntil: '2025-01-01',
      signer: {
        commonName: 'Signer CERT',
        country: 'FR',
        emailAddress: 'signer@cert.com',
        organization: 'SignerCertOrg',
        organizationIdentifier: 'SIGN-CERT',
        serialNumber: 'SN-CERT-123'
      }
    }
  }
};