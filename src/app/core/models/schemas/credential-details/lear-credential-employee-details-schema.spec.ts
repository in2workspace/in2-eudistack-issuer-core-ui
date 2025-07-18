import { groupActionsByFunction } from 'src/app/features/credential-details/helpers/credential-details-helpers';
import { LEARCredentialEmployee } from 'src/app/core/models/entity/lear-credential';
import { FunctionActions } from 'src/app/features/credential-details/helpers/credential-details-helpers';
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
    const mandatorGroup = main.find(g => g.key === 'mandator')!;
    it('extracts mandator fields correctly', () => {
      const values = (mandatorGroup.value as any[]).map((f: any) => (f.value as any)(sample));
      expect(values).toEqual([
        'Alice',
        'alice@example.com',
        'SN123',
        'ExampleOrg',
        'ORG-001',
        'ES',
      ]);
    });

    const mandateeGroup = main.find(g => g.key === 'mandatee')!;
    it('extracts mandatee fields correctly', () => {
      const values = (mandateeGroup.value as any[]).map((f: any) => (f.value as any)(sample));
      expect(values).toEqual([
        'Bob Builder',
        'bob@builder.com',
        'ES',
      ]);
    });

    it('computes power field using groupActionsByFunction', () => {
      const powerField = main.find(f => f.key === 'power')!;
      const extractor = (powerField.custom! as any).value as (c: LEARCredentialEmployee) => FunctionActions[];
      const result = extractor(sample);
      const expected: FunctionActions[] = groupActionsByFunction(sample.credentialSubject.mandate.power);

      expect(result).toEqual(expected);
      expect(expected).toContainEqual({ function: 'f1', actions: expect.arrayContaining(['a1', 'a2']) });
      expect(expected).toContainEqual({ function: 'f2', actions: ['b1'] });
    });
  });

  describe('side section', () => {
    const issuerGroup = side.find(g => g.key === 'issuer')!;

    it('extracts issuer fields correctly when issuer is present', () => {
      const values = (issuerGroup.value as any[]).map((f: any) => (f.value as any)(sample));
      expect(values).toEqual([
        'IssuerCo',
        'ISBN-456',
        'IssuerOrg',
        'ISS-002',
        'DE',
      ]);
    });

    it('returns undefined for issuer fields when issuer is missing', () => {
      const noIssuer = { ...sample, issuer: undefined } as any as LEARCredentialEmployee;
      const values = (issuerGroup.value as any[]).map((f: any) => (f.value as any)(noIssuer));
      expect(values).toEqual([undefined, undefined, undefined, undefined, undefined]);
    });
  });
});
