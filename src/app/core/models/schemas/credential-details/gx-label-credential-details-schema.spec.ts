import { isGxLabel } from 'src/app/features/credential-details/helpers/credential-details-helpers';
import { GxLabelCredential, LEARCredential, CompliantCredential } from 'src/app/core/models/entity/lear-credential';
import { CompliantCredentialsComponent, compliantCredentialsToken } from 'src/app/features/credential-details/components/compliant-credentials/compliant-credentials.component';
import { DetailsKeyValueField } from '../../entity/lear-credential-details';
import { GxLabelCredentialDetailsTemplateSchema } from './gx-label-credential-details-schema';

describe('GxLabelCredentialDetailsTemplateSchema', () => {
  const sampleLabel: GxLabelCredential = {
    type: ['gx:LabelCredential'],
    credentialSubject: {
      id: 'ID1',
      'gx:labelLevel': 'BL',
      'gx:engineVersion': 'E1',
      'gx:rulesVersion': 'R1',
      'gx:compliantCredentials': [
        { id: '1', type: 't1', 'gx:digestSRI': 's1' },
        { id: '2', type: 't2', 'gx:digestSRI': 's2' },
      ] as CompliantCredential[],
      'gx:validatedCriteria': [
        'https://w3id.org/gaia-x/specs/cd25.04/criterion/P1.2.5',
        'https://w3id.org/gaia-x/specs/cd25.03/criterion/P1.2.4',
        'https://w3id.org/gaia-x/specs/cd25.01/criterion/P1.2.3'
      ],
    },
    issuer: 'ISSUER1',
    id: '',
    issuanceDate: '',
    credentialSubjectFormat: '',
  } as any;

  const sampleNonLabel: LEARCredential = {
    type: ['OtherType'],
    credentialSubject: {},
    issuer: 'IGNORED',
    id: '',
    issuanceDate: '',
    credentialSubjectFormat: '',
  } as any;

  const { main, side } = GxLabelCredentialDetailsTemplateSchema;

  describe('main section', () => {
    it('defines basic group with correct id, labelLevel, engineVersion, rulesVersion mapping', () => {
      const basicGroup = main.find((g: any) => g.key === 'basic')!;
      const fields = basicGroup.value as any[];

      // id
      expect(fields[0].key).toBe('id');
      expect((fields[0].value as any)(sampleLabel)).toBe('ID1');

      // labelLevel: 'BL' maps to 'Base Level'
      expect(fields[1].key).toBe('gx:labelLevel');
      expect((fields[1].value as any)(sampleLabel)).toBe('Base Level');

      // engineVersion
      expect(fields[2].key).toBe('gx:engineVersion');
      expect((fields[2].value as any)(sampleLabel)).toBe('E1');

      // rulesVersion for isGxLabel true
      expect(isGxLabel(sampleLabel)).toBe(true);
      expect(fields[3].key).toBe('gx:rulesVersion');
      expect((fields[3].value as any)(sampleLabel)).toBe('R1');

      // rulesVersion for non-label
      expect(isGxLabel(sampleNonLabel)).toBe(false);
      expect((fields[3].value as any)(sampleNonLabel)).toEqual([]);
    });

    it('defines gx:compliantCredentials group with custom component and token', () => {
      const compGroup = main.find((g: any) => g.key === 'gx:compliantCredentials')!;
      expect(compGroup.custom!.component).toBe(CompliantCredentialsComponent);
      expect(compGroup.custom!.token).toBe(compliantCredentialsToken);

      // value function returns subject array when label
      const valueFn = compGroup.custom!.value as any;
      expect(valueFn(sampleLabel)).toEqual(sampleLabel.credentialSubject['gx:compliantCredentials']);

      // returns [] when not label
      expect(valueFn(sampleNonLabel)).toEqual([]);
    });

    it('defines gx:validatedCriteria group', () => {
      const valGroup = main.find((g: any) => g.key === 'gx:validatedCriteriaReference')!;
      const valueFn = valGroup.value as any;

      expect(valueFn(sampleLabel)).toEqual([
        { type: 'key-value', value: 'https://w3id.org/gaia-x/specs/cd25.04' },
        { type: 'key-value', value: 'https://w3id.org/gaia-x/specs/cd25.03' },
        { type: 'key-value', value: 'https://w3id.org/gaia-x/specs/cd25.01' },
      ]);

      expect(valueFn(sampleNonLabel)).toEqual([]);

      const noCritLabel = {
        ...sampleLabel,
        credentialSubject: {
          ...sampleLabel.credentialSubject,
          'gx:validatedCriteria': []
        }
      } as any;
      expect(valueFn(noCritLabel)).toEqual([
        { type: 'key-value', value: null }
      ]);
    });
  });

  describe('side section', () => {
    it('extracts issuer field correctly', () => {
      const issuerGroup = side.find((g: any) => g.key === 'issuer')! as any;
      const field = issuerGroup.value[0] as any;
      expect(field.key).toBe('id');
      expect((field.value as any)(sampleLabel)).toBe('ISSUER1');
    });
  });
});
