import { isVerifiable, mapComplianceEntries } from 'src/app/features/credential-details/helpers/credential-details-helpers';
import { LEARCredential, VerifiableCertification, ComplianceEntry } from 'src/app/core/models/entity/lear-credential';
import { ViewModelSchema } from '../../entity/lear-credential-details';
import { VerifiableCertificationDetailsViewModelSchema } from './verifiable-certification-details-schema';
import { commonIssuerDetailsField } from './common-issuer-details-field';

describe('VerifiableCertificationDetailsViewModelSchema', () => {
  const sample: VerifiableCertification = {
    credentialSubject: {
      company: {
        id: 'C1',
        commonName: 'CompCo',
        organization: 'CompOrg',
        country: 'FR',
        email: 'contact@comp.co',
        address: '123 Comp St',
      },
      product: {
        productId: 'P1',
        productName: 'ProdName',
        productVersion: 'v2.0',
      },
      compliance: [
        { id: '1', hash: 'h1', scope: 's1', standard: 'std1' },
        { id: '2', hash: 'h2', scope: 's2', standard: 'std2' },
      ] as ComplianceEntry[],
    },
    attester: {
      id: 'A1',
      firstName: 'Att',
      lastName: 'Ester',
      organization: 'AttOrg',
      organizationIdentifier: 'ATT-001',
      country: 'US',
    },
    issuer: {
      commonName: 'IssCo',
      organization: 'IssOrg',
      country: 'DE',
    },
    type: [],
    id: '',
    issuanceDate: '',
    credentialSubjectFormat: '',
  } as any;

  const schema: ViewModelSchema = VerifiableCertificationDetailsViewModelSchema;
  const main = schema.main;
  const side = schema.side;

  describe('main section', () => {
    it('extracts company group fields correctly', () => {
      const companyGroup = main.find(g => g.key === 'company')! as any;
      const values = companyGroup.value.map((f:any) => (f.value as any)(sample));
      expect(values).toEqual([
        'C1',
        'CompCo',
        'CompOrg',
        'FR',
        'contact@comp.co',
        '123 Comp St',
      ]);
    });

    it('extracts product group fields correctly', () => {
      const productGroup = main.find(g => g.key === 'product')! as any;
      const values = productGroup.value.map((f:any) => (f.value as any)(sample)) as any;
      expect(values).toEqual([
        'P1',
        'ProdName',
        'v2.0',
      ]);
    });

    it('maps compliance entries when credential is verifiable', () => {
      expect(isVerifiable(sample as LEARCredential)).toBeTruthy();
      const complianceField = main.find(g => g.key === 'compliance')!;
      const mapped = (complianceField.value as any)(sample as LEARCredential);
      const expected = mapComplianceEntries(sample.credentialSubject.compliance);
      expect(mapped).toEqual(expected);
      // spot-check first entry
      expect(expected[0]).toEqual({
        key: '1',
        type: 'group',
        value: [
          { key: 'hash', type: 'key-value', value: 'h1' },
          { key: 'scope', type: 'key-value', value: 's1' },
          { key: 'standard', type: 'key-value', value: 'std1' },
        ],
      });
    });

    it('returns empty compliance array when not verifiable', () => {
      const fake: LEARCredential = { credentialSubject: { foo: 'bar' } } as any;
      expect(isVerifiable(fake)).toBeFalsy();
      const complianceField = main.find(g => g.key === 'compliance')!;
      const mapped = (complianceField.value as any)(fake);
      expect(mapped).toEqual([]);
    });
  });

  describe('side section', () => {
    it('extracts attester fields correctly', () => {
      const attesterGroup = side.find(g => g.key === 'attester')! as any;
      const values = attesterGroup.value.map((f:any)  => (f.value as any)(sample));
      expect(values).toEqual([
        'A1',
        'Att',
        'Ester',
        'AttOrg',
        'ATT-001',
        'US',
      ]);
    });

    it('uses common issuer', () => {
      expect(side[1]).toBe(commonIssuerDetailsField);
      expect(side[1].key).toBe('issuer');
      expect(side[1].type).toBe('group');
    });

    
  });
});
