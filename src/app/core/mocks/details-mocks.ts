import { LEARCredentialDataDetails } from "../models/entity/lear-credential";

// todo restore type
export const mockCredentialEmployee: any = {
  procedure_id: 'mock-procedure-employee',
  credential_status: 'DRAFT',
  credential: {
    sub: null,
    nbf: '1714675200',
    iss: 'issuer-emp',
    exp: '1735689600',
    iat: '1714675200',
    jti: 'jti-emp-123',
    vc: {
      id: 'cred-emp',
      type: ['VerifiableCredential', 'LEARCredentialEmployee'],
      description: 'Mock employee credential',
      issuer: {
        id: 'issuer-emp',
        commonName: 'Employee Issuer',
        // country: 'ES',
        organization: 'Org EMP',
        organizationIdentifier: 'IDentifier Org',
        emailAddress: 'email',
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
            // commonName: 'Mandator EMP',
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

export const mockCredentialMachine: LEARCredentialDataDetails = {
  procedure_id: 'mock-procedure-machine',
  credential_status: 'PEND_SIGNATURE',
  credential: {
    sub: null,
    nbf: '1714675200',
    iss: 'issuer-mac',
    exp: '1735689600',
    iat: '1714675200',
    jti: 'jti-mac-123',
    vc: {
      id: 'cred-mac',
      type: ['LEARCredentialMachine'],
      description: 'Mock machine credential',
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
            serviceName: 'Service X',
            serviceType: 'API',
            version: '1.0',
            domain: 'cloud',
            ipAddress: '192.168.0.1',
            description: 'Main processing unit',
            contact: {
              email: 'contact@machine.com',
              phone: '+34999999999'
            }
          },
          mandator: {
            commonName: 'Mandator MAC',
            country: 'DE',
            emailAddress: 'mandator@mac.com',
            organization: 'Org Mandator MAC',
            organizationIdentifier: 'ORG-MAN-MAC',
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

export const mockCredentialCertification: LEARCredentialDataDetails = {
  procedure_id: 'mock-procedure-cert',
  credential_status: 'PEND_DOWNLOAD',
  credential: {
    sub: null,
    nbf: '1714675200',
    iss: 'issuer-cert',
    exp: '1735689600',
    iat: '1714675200',
    jti: 'jti-cert-123',
    vc: {
      id: 'cred-cert',
      type: ['VerifiableCertification'],
      issuer: {
        id: 'issuer-cert',
        commonName: 'Cert Issuer',
        country: 'FR',
        organization: 'Org CERT'
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

export const mockGxLabel: LEARCredentialDataDetails = {
  procedure_id: 'mock-procedure-gx-label',
  credential_status: 'DRAFT',
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
          'criterion-identity',
          'criterion-authenticity',
          'criterion-integrity'
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