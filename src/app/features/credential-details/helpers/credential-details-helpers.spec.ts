import { DetailsGroupField } from 'src/app/core/models/entity/lear-credential-details';
import {
  groupActionsByFunction,
  mapComplianceEntries,
  isVerifiable,
  isGxLabel
} from './credential-details-helpers';
import { Power, ComplianceEntry, LEARCredential } from 'src/app/core/models/entity/lear-credential';

describe('Credential Details Helpers', () => {
  describe('groupActionsByFunction', () => {
    it('should return an empty array when given no powers', () => {
      expect(groupActionsByFunction([])).toEqual([]);
    });

    it('should group actions by function and dedupe them', () => {
      const powers: Power[] = [
        { domain: 'd1', function: 'fn1', action: 'a1', type: 't1' },
        { domain: 'd1', function: 'fn1', action: ['a2', 'a1'], type: 't1' },
        { domain: 'd2', function: 'fn2', action: 'b1', type: 't2' },
      ];
      const result = groupActionsByFunction(powers);

      expect(result).toEqual([
        { function: 'fn1', actions: ['a1', 'a2'] },
        { function: 'fn2', actions: ['b1'] },
      ]);
    });
  });

  describe('mapComplianceEntries', () => {
    it('should return an empty array when given no compliances', () => {
      expect(mapComplianceEntries([])).toEqual([]);
    });

    it('should map each ComplianceEntry into a DetailsGroupField with key-value subfields', () => {
      const compliances: ComplianceEntry[] = [
        { id: '1', hash: 'h1', scope: 's1', standard: 'std1' },
        { id: '2', hash: 'h2', scope: 's2', standard: 'std2' },
      ];
      const result = mapComplianceEntries(compliances);

      expect(result).toEqual<DetailsGroupField[]>([
        {
          key: '1',
          type: 'group',
          value: [
            { key: 'hash', type: 'key-value', value: 'h1' },
            { key: 'scope', type: 'key-value', value: 's1' },
            { key: 'standard', type: 'key-value', value: 'std1' },
          ],
        },
        {
          key: '2',
          type: 'group',
          value: [
            { key: 'hash', type: 'key-value', value: 'h2' },
            { key: 'scope', type: 'key-value', value: 's2' },
            { key: 'standard', type: 'key-value', value: 'std2' },
          ],
        },
      ]);
    });
  });

  describe('isVerifiable', () => {
    it('should return true if credentialSubject has a compliance property', () => {
      const cred = { credentialSubject: { compliance: [] } } as any as LEARCredential;
      expect(isVerifiable(cred)).toBe(true);
    });

    it('should return false if credentialSubject lacks a compliance property', () => {
      const cred = { credentialSubject: { foo: 'bar' } } as any as LEARCredential;
      expect(isVerifiable(cred)).toBe(false);
    });
  });

  describe('isGxLabel', () => {
    it('should return true if type includes "gx:LabelCredential"', () => {
      const cred = { type: ['gx:LabelCredential'] } as any as LEARCredential;
      expect(isGxLabel(cred)).toBe(true);
    });

    it('should return false if type does not include "gx:LabelCredential"', () => {
      const cred = { type: ['SomeOtherType'] } as any as LEARCredential;
      expect(isGxLabel(cred)).toBe(false);
    });
  });
});
