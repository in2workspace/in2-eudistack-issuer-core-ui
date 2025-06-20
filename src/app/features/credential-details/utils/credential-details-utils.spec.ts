import { getFormSchemaByType, mapPowerArrayByFunction, shouldSkipIssuer } from './credential-details-utils';
import { CredentialType } from 'src/app/core/models/entity/lear-credential';
import { LearCredentialEmployeeDetailsFormSchema, LearCredentialMachineDetailsFormSchema, VerifiableCertificationDetailsFormSchema } from 'src/app/core/models/entity/lear-credential-details';
import { Power } from 'src/app/core/models/entity/lear-credential';
import { getFormDataByType } from './credential-details-utils';
import {
  LEARCredentialEmployee,
  LEARCredentialMachine,
  VerifiableCertification,
} from 'src/app/core/models/entity/lear-credential';

describe('getFormSchemaByType', () => {
  it('should return schema for LEARCredentialEmployee', () => {
    const schema = getFormSchemaByType('LEARCredentialEmployee');
    expect(schema).toBe(LearCredentialEmployeeDetailsFormSchema);
  });

  it('should return schema for LEARCredentialMachine', () => {
    const schema = getFormSchemaByType('LEARCredentialMachine');
    expect(schema).toBe(LearCredentialMachineDetailsFormSchema);
  });

  it('should return schema for VerifiableCertification', () => {
    const schema = getFormSchemaByType('VerifiableCertification');
    expect(schema).toBe(VerifiableCertificationDetailsFormSchema);
  });

  it('should throw an error for unsupported type', () => {
    expect(() => getFormSchemaByType('UnknownType' as CredentialType)).toThrowError(
      'Unsupported credential type: UnknownType'
    );
  });
});


describe('getFormSchemaByType', () => {
    it('should return the correct schema for LEARCredentialEmployee', () => {
      const result = getFormSchemaByType('LEARCredentialEmployee');
      expect(result).toBe(LearCredentialEmployeeDetailsFormSchema);
    });
  
    it('should return the correct schema for LEARCredentialMachine', () => {
      const result = getFormSchemaByType('LEARCredentialMachine');
      expect(result).toBe(LearCredentialMachineDetailsFormSchema);
    });
  
    it('should return the correct schema for VerifiableCertification', () => {
      const result = getFormSchemaByType('VerifiableCertification');
      expect(result).toBe(VerifiableCertificationDetailsFormSchema);
    });
  
    it('should throw an error for an unsupported type', () => {
      expect(() =>
        getFormSchemaByType('UnsupportedType' as CredentialType)
      ).toThrowError('Unsupported credential type: UnsupportedType');
    });
  });

describe('getFormDataByType', () => {
  it('should return extracted form data for LEARCredentialEmployee', () => {
    const credential: LEARCredentialEmployee = {
      id: '1',
      type: ['LEARCredentialEmployee'],
      description: 'desc',
      credentialSubject: {
        mandate: {
          id: 'm1',
          life_span: { start: '2023-01-01', end: '2023-12-31' },
          mandatee: {
            email: 'test@test.com',
            firstName: 'John',
            lastName: 'Doe',
            nationality: 'ES',
          },
          mandator: {
            commonName: '',
            country: '',
            emailAddress: '',
            organization: '',
            organizationIdentifier: '',
            serialNumber: '',
          },
          power: [
            {
              function: 'Login',
              action: ['Execute'],
              domain: 'test',
              type: 'custom',
            },
          ],
          signer: {
            commonName: '',
            country: '',
            emailAddress: '',
            organization: '',
            organizationIdentifier: '',
            serialNumber: '',
          },
        },
      },
      issuer: {
        id: 'issuer1',
        organizationIdentifier: '',
        organization: '',
        country: '',
        commonName: '',
        emailAddress: '',
        serialNumber: '',
      },
      validFrom: '2023-01-01',
      validUntil: '2023-12-31',
    };

    const result = getFormDataByType(credential, 'LEARCredentialEmployee');
    expect(result).toHaveProperty('issuer');
    expect(result).toHaveProperty('mandatee');
    expect(result).toHaveProperty('mandator');
    expect(result).toHaveProperty('power');
  });

  it('should throw an error for unsupported type', () => {
    expect(() =>
      getFormDataByType({} as any, 'UnsupportedType' as any)
    ).toThrowError('Unsupported data extractor for type: UnsupportedType');
  });
});

it('should return extracted form data for LEARCredentialMachine', () => {
    const credential: LEARCredentialMachine = {
      id: '2',
      type: ['LEARCredentialMachine'],
      description: 'machine cred',
      credentialSubject: {
        mandate: {
          id: 'm2',
          life_span: { start: '2023-01-01', end: '2023-12-31' },
          mandatee: {
            id: 'mandateeId',
            serviceName: 'Service A',
            serviceType: 'API',
            version: '1.0',
            domain: 'test.com',
            ipAddress: '127.0.0.1',
            description: 'Test machine',
            contact: {
              email: 'machine@test.com',
              phone: '123456789',
            },
          },
          mandator: {
            commonName: '',
            country: '',
            emailAddress: '',
            organization: '',
            organizationIdentifier: '',
            serialNumber: '',
          },
          power: [
            {
              function: 'Onboarding',
              action: ['Execute', 'Create'],
              domain: 'iot',
              type: 'custom',
            },
          ],
          signer: {
            commonName: '',
            country: '',
            emailAddress: '',
            organization: '',
            organizationIdentifier: '',
            serialNumber: '',
          },
        },
      },
      issuer: {
        id: 'issuer2',
        organizationIdentifier: '',
        organization: '',
        country: '',
        commonName: '',
        emailAddress: '',
        serialNumber: '',
      },
      validFrom: '2023-01-01',
      validUntil: '2023-12-31',
    };
  
    const result = getFormDataByType(credential, 'LEARCredentialMachine');
    expect(result).toHaveProperty('issuer');
    expect(result).toHaveProperty('mandatee');
    expect(result).toHaveProperty('mandator');
    expect(result).toHaveProperty('power');
  });
  
  it('should return extracted form data for VerifiableCertification', () => {
    const credential: VerifiableCertification = {
      id: '3',
      type: ['VerifiableCertification'],
      issuer: {
        id: 'issuer3',
        organization: 'CertOrg',
        country: 'ES',
        commonName: 'CertName',
      },
      credentialSubject: {
        company: {
          id: 'comp1',
          organization: 'Org SA',
          address: 'Carrer Falsa 123',
          country: 'ES',
          commonName: 'OrgName',
          email: 'org@example.com',
        },
        product: {
          productId: 'prod1',
          productName: 'Product A',
          productVersion: '1.0',
        },
        compliance: [
          {
            standard: 'ISO9001',
            id: 'c1',
            hash: 'abc123',
            scope: 'general',
          },
          {
            standard: 'ISO27001',
            id: 'c2',
            hash: 'xyz789',
            scope: 'security',
          },
        ],
      },
      attester: {
        id: 'att1',
        organization: 'AttOrg',
        organizationIdentifier: 'att-org-123',
        firstName: 'Anna',
        lastName: 'Signer',
        country: 'FR',
      },
      validFrom: '2023-01-01',
      validUntil: '2024-01-01',
      signer: {
        commonName: '',
        country: '',
        emailAddress: '',
        organization: '',
        organizationIdentifier: '',
        serialNumber: '',
      },
    };
  
    const result = getFormDataByType(credential, 'VerifiableCertification');
    expect(result).toHaveProperty('issuer');
    expect(result).toHaveProperty('attester');
    expect(result).toHaveProperty('company');
    expect(result).toHaveProperty('product');
    expect(result).toHaveProperty('compliance');
  });


describe('mapPowerArrayByFunction', () => {
  it('should map an array of Power objects to grouped actions by function', () => {
    const input: Power[] = [
      { function: 'Login', action: ['Execute', 'Delete'], domain: '', type: '' },
      { function: 'Login', action: 'Create', domain: '', type: '' },
      { function: 'ProductOffering', action: 'Update', domain: '', type: '' }
    ];

    const expected = {
      Login: {
        Execute: true,
        Delete: true,
        Create: true
      },
      ProductOffering: {
        Update: true
      }
    };

    expect(mapPowerArrayByFunction(input)).toEqual(expected);
  });

  it('should return an empty object if the input is an empty array', () => {
    expect(mapPowerArrayByFunction([])).toEqual({});
  });
});

import { buildFormFromSchema } from './credential-details-utils';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

describe('buildFormFromSchema', () => {
  const fb = new FormBuilder();

  it('should build a form with control, group, power and compliance fields', () => {
    const schema = {
      name: { type: 'control' },
      nested: {
        type: 'group',
        fields: {
          age: { type: 'control' },
        },
      },
      power: {
        type: 'group',
        fields: {},
      },
      compliance: {
        type: 'group',
        fields: {},
      },
    };

    const data = {
      name: 'Alice',
      nested: {
        age: 30,
      },
      power: {
        Login: {
          Execute: true,
          Create: true,
        },
      },
      compliance: {
        ISO9001: {
          id: 'id1',
          hash: 'hash1',
          scope: 'scope1',
        },
        ISO27001: {
          id: 'id2',
          hash: 'hash2',
          scope: 'scope2',
        },
      },
    };

    const form = buildFormFromSchema(fb, schema as any, data);

    expect(form instanceof FormGroup).toBeTruthy();
    expect(form.get('name')?.value).toBe('Alice');
    expect(form.get('nested.age')?.value).toBe(30);

    const powerGroup = form.get('power') as FormGroup;
    expect(Object.keys(powerGroup.controls)).toContain('Login');
    expect((powerGroup.get('Login') as FormGroup).get('Execute')?.value).toBeTruthy();
    expect((powerGroup.get('Login') as FormGroup).get('Create')?.value).toBeTruthy();

    const complianceGroup = form.get('compliance') as FormGroup;
    expect(complianceGroup.get('ISO9001.id')?.value).toBe('id1');
    expect(complianceGroup.get('ISO27001.hash')?.value).toBe('hash2');
  });

  it('should skip issuer field if it is a group and issuer.id is empty', () => {
    const schema = {
      issuer: {
        type: 'group',
        fields: {
          id: { type: 'control' },
        },
      },
      other: { type: 'control' },
    };

    const data = {
      issuer: { id: '' },
      other: 'value',
    };

    const form = buildFormFromSchema(fb, schema as any, data);

    expect(form.get('issuer')).toBeNull(); // no s'hauria d'incloure
    expect(form.get('other')?.value).toBe('value');
  });
});

describe('shouldSkipIssuer', () => {
  it('should return true when key is issuer, type is group and id is empty', () => {
    const result = shouldSkipIssuer('issuer', { type: 'group' }, { issuer: { id: '' } });
    expect(result).toBe(true);
  });

  it('should return false for non-issuer key', () => {
    const result = shouldSkipIssuer('mandator', { type: 'group' }, { issuer: { id: '' } });
    expect(result).toBe(false);
  });

  it('should return false if id is present', () => {
    const result = shouldSkipIssuer('issuer', { type: 'group' }, { issuer: { id: '123' } });
    expect(result).toBe(false);
  });
});