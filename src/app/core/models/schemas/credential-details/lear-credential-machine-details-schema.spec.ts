import { groupActionsByFunction, FunctionActions } from 'src/app/features/credential-details/helpers/credential-details-helpers';
import { LEARCredentialMachine } from 'src/app/core/models/entity/lear-credential';
import { LearCredentialMachineDetailsTemplateSchema } from './lear-credential-machine-details-schema';

describe('LearCredentialMachineDetailsTemplateSchema', () => {
  const sample: LEARCredentialMachine = {
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
          id: 'M123',
          domain: 'machine.local',
          ipAddress: '192.168.1.1',
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
    } as any,
    type: [],
    id: '',
    issuanceDate: '',
    credentialSubjectFormat: '',
  } as any;

  const { main, side } = LearCredentialMachineDetailsTemplateSchema;

  describe('main section', () => {
    it('extracts mandator fields correctly', () => {
      const mandatorGroup = main.find(g => g.key === 'mandator')!;
      const values = mandatorGroup.value.map((f: any) => (f.value as any)(sample));
      expect(values).toEqual([
        'Alice',
        'alice@example.com',
        'SN123',
        'ExampleOrg',
        'ORG-001',
        'ES',
      ]);
    });

    it('extracts mandatee fields correctly', () => {
      const mandateeGroup = main.find(g => g.key === 'mandatee')!;
      const values = mandateeGroup.value.map((f: any) => (f.value as any)(sample));
      expect(values).toEqual([
        'M123',
        'machine.local',
        '192.168.1.1',
      ]);
    });

    it('computes power field using groupActionsByFunction', () => {
      const powerField = main.find(f => f.key === 'power')!;
      const result = (powerField.value as any)(sample) as FunctionActions[];
      const expected = groupActionsByFunction(sample.credentialSubject.mandate.power);
      expect(result).toEqual(expected);
      expect(expected).toContainEqual({ function: 'f1', actions: expect.arrayContaining(['a1', 'a2']) });
      expect(expected).toContainEqual({ function: 'f2', actions: ['b1'] });
    });
  });

  describe('side section', () => {
    it('extracts issuer fields correctly when issuer is present', () => {
      const issuerGroup = side.find(g => g.key === 'issuer')!;
      const values = issuerGroup.value.map((f: any) => (f.value as any)(sample));
      expect(values).toEqual([
        'IssuerCo',
        'IssuerCo',       // email maps to commonName in schema
        'ISBN-456',
        'IssuerOrg',
        'ISS-002',
        'DE',
      ]);
    });

    it('returns undefined for all issuer fields when issuer is missing', () => {
      const noIssuer = { ...sample, issuer: undefined } as any as LEARCredentialMachine;
      const issuerGroup = side.find(g => g.key === 'issuer')!;
      const values = issuerGroup.value.map((f: any) => (f.value as any)(noIssuer));
      expect(values).toEqual([undefined, undefined, undefined, undefined, undefined, undefined]);
    });
  });
});
