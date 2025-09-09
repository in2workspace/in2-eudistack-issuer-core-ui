import { FormControl } from '@angular/forms';
import {
  CustomValidators,
  CUSTOM_VALIDATORS_FACTORY_MAP,
} from './custom-validators';

describe('CustomValidators', () => {
  describe('isDomain', () => {
    const validator = CustomValidators.isDomain();

    it('should accept valid domains', () => {
      expect(validator(new FormControl('example.com'))).toBeNull();
      expect(validator(new FormControl('sub.example.co.uk'))).toBeNull();
      expect(validator(new FormControl('my-domain123.io'))).toBeNull();
    });

    it('should reject invalid domains', () => {
      expect(validator(new FormControl('not a domain'))).toEqual({
        isDomain: { value: 'error.form.domain' },
      });
      expect(validator(new FormControl('example'))).toEqual({
        isDomain: { value: 'error.form.domain' },
      });
    });

    it('should reject empty or nullish values', () => {
      expect(validator(new FormControl(''))).toEqual({
        isDomain: { value: 'error.form.domain' },
      });
      expect(validator(new FormControl(null as any))).toEqual({
        isDomain: { value: 'error.form.domain' },
      });
    });
  });

  describe('isIP', () => {
    const validator = CustomValidators.isIP();

    it('should accept empty or null', () => {
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });

    it('should reject non-string values', () => {
      expect(validator(new FormControl(12345 as any))).toEqual({
        isIP: { value: 'Value must be a string' },
      });
    });

    it('should accept valid IPv4 and IPv6', () => {
      expect(validator(new FormControl('192.168.0.1'))).toBeNull();
      expect(validator(new FormControl('255.255.255.255'))).toBeNull();
      expect(validator(new FormControl('::1'))).toBeNull();
    });

    describe('CustomValidators – isIP', () => {
      const validator = CustomValidators.isIP();

      const validIPv4 = [
        '192.168.0.1',
        '0.0.0.0',
        '255.255.255.255',
        '8.8.4.4',
        '123.45.67.89',
      ];

      const invalidIPv4 = [
        '256.100.50.25',
        '1234.5.6.7',
        '1.2.3.4.5',
        '256.100.50.25',
        '1234.5.6.7', 
      ];

      const validIPv6 = [
        '2001:0db8:0000:0000:0000:ff00:0042:8329',
        '2001:db8:85a3::8a2e:370:7334',
        '::1',
        'fe80::',
        '::ffff:192.0.2.128'
      ];

      const invalidIPv6 = [
        '2001:db8:85a3:::8a2e',
        '12345::',
        ':1:2:3:4:5:6:7',
        '2001:db8:85a3:::8a2e',
        'hello::world',
      ];

      it('accepts valid IPv4 ', () => {
        validIPv4.forEach(addr => {
          expect(validator(new FormControl(addr))).toBeNull();
        });
      });

      it('rejects invalid IPv4', () => {
        invalidIPv4.forEach(addr => {
          expect(validator(new FormControl(addr))).toEqual({
            isIP: { value: 'error.form.ip' },
          });
        });
      });

      it('accepts valid IPv6', () => {
        validIPv6.forEach(addr => {
          expect(validator(new FormControl(addr))).toBeNull();
        });
      });

      it('rejects invalid IPv6', () => {
        invalidIPv6.forEach(addr => {
          expect(validator(new FormControl(addr))).toEqual({
            isIP: { value: 'error.form.ip' },
          });
        });
      });
    });
  });

  describe('customEmail', () => {
    const validator = CustomValidators.customEmail();

    it('should ignore empty, null, or non-strings', () => {
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null as any))).toBeNull();
      expect(validator(new FormControl(123 as any))).toBeNull();
    });

    it('should reject basic invalid email pattern', () => {
      expect(validator(new FormControl('not-an-email'))).toEqual({
        customEmail: { value: 'error.form.email.invalid' },
      });
    });

    it('should enforce local-part max length', () => {
      const longLocal =
        'a'.repeat(65) + '@example.com';
      expect(validator(new FormControl(longLocal))).toEqual({
        customEmail: { value: 'error.form.email.local_part_max' },
      });
    });

    it('should enforce domain-part max length', () => {
      const longDomain = 'user@' + 'a'.repeat(256) + '.com';
      expect(validator(new FormControl(longDomain))).toEqual({
        customEmail: { value: 'error.form.email.domain_part_max' },
      });
    });

    it('should enforce main-domain part minimum length', () => {
      expect(validator(new FormControl('u@d.c'))).toEqual({
        customEmail: { value: 'error.form.email.main_domain_part_min' },
      });
    });

    it('should enforce top-level-domain minimum length', () => {
      expect(validator(new FormControl('u@domain.c'))).toEqual({
        customEmail: { value: 'error.form.email.top_level_domain_part_min' },
      });
    });

    it('should accept a valid email', () => {
      expect(
        validator(new FormControl('user.name+tag@example-domain.com'))
      ).toBeNull();
    });
  });

  describe('unicode', () => {
    const validator = CustomValidators.unicode();

    it('should ignore empty or null', () => {
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null as any))).toBeNull();
    });

    it('should accept valid unicode names', () => {
      expect(validator(new FormControl("José Álvarez"))).toBeNull();
      expect(validator(new FormControl("O'Connor"))).toBeNull();
      expect(validator(new FormControl('Anne-Marie'))).toBeNull();
    });

    it('should reject strings with invalid characters', () => {
      expect(validator(new FormControl('Name123'))).toEqual({
        unicode: { value: 'error.form.invalid_character' },
      });
      expect(validator(new FormControl('Hello!'))).toEqual({
        unicode: { value: 'error.form.invalid_character' },
      });
    });
  });

  describe('orgIdentifier', () => {
    const validator = CustomValidators.orgIdentifier();

    it('should ignore empty or null', () => {
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null as any))).toBeNull();
    });

    it('should reject identifiers starting with VAT (case-insensitive)', () => {
      expect(validator(new FormControl('VAT1234'))).toEqual({
        orgIdentifier: { value: 'error.form.org_id_startsWithVAT' },
      });
      expect(validator(new FormControl('vatXYZ'))).toEqual({
        orgIdentifier: { value: 'error.form.org_id_startsWithVAT' },
      });
    });

    it('should accept valid alphanumeric identifiers', () => {
      expect(validator(new FormControl('ABC123'))).toBeNull();
    });

    it('should reject identifiers with non-alphanumeric chars', () => {
      expect(validator(new FormControl('ABC-123'))).toEqual({
        orgIdentifier: { value: 'error.form.pattern' },
      });
      expect(validator(new FormControl('123 456'))).toEqual({
        orgIdentifier: { value: 'error.form.pattern' },
      });
    });
  });

  describe('orgName', () => {
    const validator = CustomValidators.orgName();

    it('should ignore empty or null', () => {
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null as any))).toBeNull();
    });

    it('should accept valid organization names', () => {
      expect(validator(new FormControl("My Company, S.L."))).toBeNull();
      expect(validator(new FormControl("ACME & Sons-123"))).toBeNull();
      expect(validator(new FormControl("Firm (International)/Division"))).toBeNull();
    });

    it('should reject names with disallowed characters', () => {
      expect(validator(new FormControl('会社'))).toEqual({
        orgName: { value: 'error.form.pattern' },
      });
      expect(validator(new FormControl('Name!'))).toEqual({
        orgName: { value: 'error.form.pattern' },
      });
    });
  });

  describe('CUSTOM_VALIDATORS_FACTORY_MAP', () => {
    it('should map all keys to the corresponding static method', () => {
      for (const key of Object.keys(CUSTOM_VALIDATORS_FACTORY_MAP) as Array<keyof typeof CUSTOM_VALIDATORS_FACTORY_MAP>) {
        expect(CUSTOM_VALIDATORS_FACTORY_MAP[key]).toBe(
          // @ts-ignore
          (CustomValidators as any)[key]
        );
      }
    });
  });
});
