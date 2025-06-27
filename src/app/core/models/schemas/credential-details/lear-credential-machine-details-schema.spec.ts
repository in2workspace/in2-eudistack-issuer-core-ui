import { groupActionsByFunction, FunctionActions } from 'src/app/features/credential-details/helpers/credential-details-helpers';
import { LEARCredentialEmployee } from 'src/app/core/models/entity/lear-credential';
import { LearCredentialEmployeeDetailsTemplateSchema } from './lear-credential-employee-details-schema';

describe('LearCredentialEmployeeDetailsTemplateSchema', () => {
  const sample: LEARCredentialEmployee = {
    credentialSubject: {
      mandate: {
        mandator: {
          commonName: 'Alice',
          emailAddress: 'alice@example.com',
          serialNumber: 'SN123',
          organization: 'ExampleOrg',
          organizationIdentifier: 'ORG-001',
          country: 'ES',
        },
        mandatee: {
          firstName: 'Bob',
          lastName: 'Builder',
          email: 'bob@builder.com',
          nationality: 'ES',
        },
        power: [
          { function: 'f1', action: 'a1', domain: 'd', type: 't' },
          { function: 'f1', action: ['a2', 'a1'], domain: 'd', type: 't' },
          { function: 'f2', action: 'b1', domain: 'd', type: 't' },
        ],
      },
    } as any,
    issuer: {
      commonName: 'IssuerCo',
      serialNumber: 'ISBN-456',
      organization: 'IssuerOrg',
      organizationIdentifier: 'ISS-002',
      country: 'DE',
    },
    type: [],
    id: '',
    issuanceDate: '',
    credentialSubjectFormat: '',
  } as any;

  const { main, side } = LearCredentialEmployeeDetailsTemplateSchema;

  describe('main section', () => {
    it('extracts all mandator fields correctly', () => {
      const mandatorGroup = main.find(g => g.key === 'mandator')!;
      const values = mandatorGroup.value.map((f:any) => (f.value as any)(sample));
      expect(values).toEqual([
        'Alice',
        'alice@example.com',
        'SN123',
        'ExampleOrg',
        'ORG-001',
        'ES',
      ]);
    });

    it('extracts all mandatee fields correctly', () => {
      const mandateeGroup = main.find(g => g.key === 'mandatee')!;
      const values = mandateeGroup.value.map((f:any) => (f.value as any)(sample));
      expect(values).toEqual([
        'Bob Builder',
        'bob@builder.com',
        'ES',
      ]);
    });

    it('computes power field with groupActionsByFunction', () => {
      const powerField = main.find(f => f.key === 'power')!;
      const result = (powerField.value as any)(sample) as FunctionActions[];
      const expected = groupActionsByFunction(sample.credentialSubject.mandate.power);
      expect(result).toEqual(expected);
      // ensure deduplication and grouping
      expect(expected).toContainEqual({ function: 'f1', actions: expect.arrayContaining(['a1', 'a2']) });
      expect(expected).toContainEqual({ function: 'f2', actions: ['b1'] });
    });
  });

  describe('side section', () => {
    it('extracts issuer group fields when issuer is present', () => {
      const issuerGroup = side.find(g => g.key === 'issuer')!;
      const values = issuerGroup.value.map((f:any) => (f.value as any)(sample));
      expect(values).toEqual([
        'IssuerCo',
        'ISBN-456',
        'IssuerOrg',
        'ISS-002',
        'DE',
      ]);
    });

    it('returns undefined for each issuer field when issuer is missing', () => {
      const noIssuer = { ...sample, issuer: undefined } as any as LEARCredentialEmployee;
      const issuerGroup = side.find(g => g.key === 'issuer')!;
      const values = issuerGroup.value.map((f:any) => (f.value as any)(noIssuer));
      expect(values).toEqual([undefined, undefined, undefined, undefined, undefined]);
    });
  });
});
