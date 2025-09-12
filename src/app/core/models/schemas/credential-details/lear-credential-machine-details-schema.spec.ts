import { groupActionsByFunction, FunctionActions } from 'src/app/features/credential-details/helpers/credential-details-helpers';
import { LEARCredentialMachine } from 'src/app/core/models/entity/lear-credential';
import { LearCredentialMachineDetailsViewModelSchema } from './lear-credential-machine-details-schema';

describe('LearCredentialMachineDetailsViewModelSchema', () => {
  const sample: LEARCredentialMachine = {
    credentialSubject: {
      mandate: {
        mandator: {
          commonName: 'Alice',
          email: 'alice@example.com',
          serialNumber: 'SN123',
          organization: 'ExampleOrg',
          id: 'ORG-001',
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
      id: 'did-elsi:test',
      emailAddress: 'aaa@email.test',
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

  const { main, side } = LearCredentialMachineDetailsViewModelSchema;

  describe('main section', () => {
    it('extracts mandator fields correctly', () => {
      const mandatorGroup = main.find(g => g.key === 'mandator')! as any;
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
      const mandateeGroup = main.find(g => g.key === 'mandatee')!  as any;
      const values = mandateeGroup.value.map((f: any) => (f.value as any)(sample));
      expect(values).toEqual([
        'M123',
        'machine.local',
        '192.168.1.1',
      ]);
    });

    it('computes power field using groupActionsByFunction', () => {
      const powerField = main.find(f => f.key === 'power')!;
      const extractor = (powerField.custom! as any).value as (c: LEARCredentialMachine) => FunctionActions[];
      const result = extractor(sample);
      const expected: FunctionActions[] = groupActionsByFunction(sample.credentialSubject.mandate.power);

      expect(result).toEqual(expected);
      expect(expected).toContainEqual({ function: 'f1', actions: expect.arrayContaining(['a1', 'a2']) });
      expect(expected).toContainEqual({ function: 'f2', actions: ['b1'] });
    });
  });

  describe('side section', () => {
    const issuerGroup = side.find(g => g.key === 'issuer')!  as any;
    it('extracts issuer fields correctly when issuer is present', () => {
      const values = issuerGroup.value.map((f: any) => (f.value as any)(sample));
      expect(values).toEqual([
        'did-elsi:test',
        'IssuerCo',
        'aaa@email.test',
        'ISBN-456',
        'IssuerOrg',
        'ISS-002',
        'DE',
      ]);
    });

    it('returns undefined for all issuer fields when issuer is missing', () => {
      const noIssuer = { ...sample, issuer: undefined } as any as LEARCredentialMachine;
      const values = issuerGroup.value.map((f: any) => (f.value as any)(noIssuer));
      expect(values).toEqual([undefined, undefined, undefined, undefined, undefined, undefined]);
    });

    it('handles issuer when it is a string', () => {
      const stringIssuer = { ...sample, issuer: 'simple-issuer-id' } as any as LEARCredentialMachine;
      const values = (issuerGroup.value as any[]).map((f: any) => (f.value as any)(stringIssuer));
      expect(values).toEqual([
        'simple-issuer-id',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ]);
    });
  });
});
