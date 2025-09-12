// common-issuer-details-field.spec.ts
import { commonIssuerDetailsField } from './common-issuer-details-field'; // ajusta el path si cal
import type { LEARCredential } from '../../entity/lear-credential';

type DetailsField = {
  key: string;
  type: 'key-value';
  value: () => unknown;
};

type DetailsGroupField = {
  key: string;
  type: 'group';
  value: DetailsField[] | ((c: LEARCredential) => DetailsField[]);
};

function resolveGroupValue(
  field: DetailsGroupField,
  cred: Partial<LEARCredential> | any
): DetailsField[] {
  return typeof field.value === 'function'
    ? field.value(cred as LEARCredential)
    : field.value;
}

describe('commonIssuerDetailsField', () => {
  it('should return only "id" if issuer is a string', () => {
    const issuerStr = 'did:example:123';
    const cred = { issuer: issuerStr } as Partial<LEARCredential>;

    const fields = resolveGroupValue(commonIssuerDetailsField as unknown as DetailsGroupField, cred);

    expect(commonIssuerDetailsField.key).toBe('issuer');
    expect(commonIssuerDetailsField.type).toBe('group');

    expect(Array.isArray(fields)).toBe(true);
    expect(fields).toHaveLength(1);

    const [idField] = fields;
    expect(idField.key).toBe('id');
    expect(idField.type).toBe('key-value');
    expect(idField.value()).toBe(issuerStr);
  });

  it('should map issuer correctly when it is an object', () => {
    const issuerObj = {
      id: 'did:example:abc',
      commonName: 'Acme Corp',
      emailAddress: 'contact@acme.test',
      serialNumber: 'SN-001',
      organization: 'Acme',
      organizationIdentifier: 'ORG-42',
      country: 'ES',
    };
    const cred = { issuer: issuerObj } as Partial<LEARCredential>;

    const fields = resolveGroupValue(commonIssuerDetailsField as unknown as DetailsGroupField, cred);

    const expectedKeys = [
      'id',
      'name',
      'email',
      'serialNumber',
      'organization',
      'organizationId',
      'country',
    ];
    expect(fields.map(f => f.key)).toEqual(expectedKeys);

    const values = Object.fromEntries(fields.map(f => [f.key, f.value()]));
    expect(values).toEqual({
      id: 'did:example:abc',
      name: 'Acme Corp',
      email: 'contact@acme.test',
      serialNumber: 'SN-001',
      organization: 'Acme',
      organizationId: 'ORG-42',
      country: 'ES',
    });

    fields.forEach(f => expect(f.type).toBe('key-value'));
  });

  it('should return undefined for missing values', () => {
    const issuerPartial = { id: 'did:partial' };
    const cred = { issuer: issuerPartial } as Partial<LEARCredential>;

    const fields = resolveGroupValue(commonIssuerDetailsField as unknown as DetailsGroupField, cred);
    const values = Object.fromEntries(fields.map(f => [f.key, f.value()]));

    expect(values['id']).toBe('did:partial');
    expect(values['name']).toBeUndefined();
    expect(values['email']).toBeUndefined();
    expect(values['serialNumber']).toBeUndefined();
    expect(values['organization']).toBeUndefined();
    expect(values['organizationId']).toBeUndefined();
    expect(values['country']).toBeUndefined();
  });
});
