import { groupActionsByFunction, FunctionActions } from 'src/app/features/credential-details/helpers/credential-details-helpers';
import { LEARCredentialMachine } from 'src/app/core/models/entity/lear-credential';
import { LearCredentialMachineDetailsViewModelSchema } from './lear-credential-machine-details-schema';
import { commonIssuerDetailsField } from './common-issuer-details-field';

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
    it('uses common issuer', () => {
      expect(side).toHaveLength(1);
      expect(side[0]).toBe(commonIssuerDetailsField);
      expect(side[0].key).toBe('issuer');
      expect(side[0].type).toBe('group');
    });
  });
});
