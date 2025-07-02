
import {
  LEARCredentialEmployee,
  LEARCredentialMachine, Attester,
  EmployeeMandatee,
  Power
} from '../../../core/models/entity/lear-credential';
import { LEARCredentialDataNormalizer } from './lear-credential-data-normalizer';

describe('LEARCredentialDataNormalizer', () => {
  let normalizer: LEARCredentialDataNormalizer;

  beforeEach(() => {
    normalizer = new LEARCredentialDataNormalizer();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('mètodes privats', () => {
    it('normalizeEmployeeMandatee unifica firstName/first_name i lastName/last_name', () => {
      const raw1: any = {
        firstName: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        nationality: 'US'
      };
      const raw2: any = {
        first_name: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        nationality: 'CA'
      };

      const res1 = (normalizer as any).normalizeEmployeeMandatee(raw1);
      expect(res1).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        nationality: 'US'
      });

      const res2 = (normalizer as any).normalizeEmployeeMandatee(raw2);
      expect(res2).toEqual({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        nationality: 'CA'
      });
    });

    it('normalizePower unifica action/tmf_action, domain/tmf_domain, etc.', () => {
      const raw1: any = {
        action: 'read',
        tmf_domain: 'domain.com',
        tmf_function: 'func',
        type: 'typeA'
      };
      const raw2: any = {
        tmf_action: ['write', 'execute'],
        domain: 'example.org',
        function: 'run',
        tmf_type: 'typeB'
      };

      const pow1: Power = (normalizer as any).normalizePower(raw1);
      expect(pow1).toEqual({
        action: 'read',
        domain: 'domain.com',
        function: 'func',
        type: 'typeA'
      });

      const pow2: Power = (normalizer as any).normalizePower(raw2);
      expect(pow2).toEqual({
        action: ['write', 'execute'],
        domain: 'example.org',
        function: 'run',
        type: 'typeB'
      });
    });
  });

  describe('normalizeLearCredential', () => {
    it('normalitza un LEARCredentialEmployee: mandatee i power', () => {
      const rawMandatee: any = {
        first_name: 'Alice',
        lastName: 'Wonder',
        email: 'alice@wonder.land',
        nationality: 'GB'
      };
      const rawPowers: any[] = [
        { action: 'a1', tmf_domain: 'd1', function: 'f1', tmf_type: 't1' },
        { tmf_action: 'a2', domain: 'd2', tmf_function: 'f2', type: 't2' }
      ];

      const input: LEARCredentialEmployee = {
        id: '1',
        type: ['LEARCredentialEmployee'],
        description: 'desc',
        credentialSubject: {
          mandate: {
            id: 'm1',
            life_span: {} as any,
            mandatee: rawMandatee as any,
            mandator: {} as any,
            power: rawPowers as any,
            signer: {} as any
          }
        },
        issuer: {} as any,
        validFrom: '2025-01-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        issuanceDate: '2025-01-01T00:00:00Z',
        expirationDate: '2025-12-31T23:59:59Z'
      };

      const out = normalizer.normalizeLearCredential(input as any) as any;

      // Mandatee normalitzat
      expect((out.credentialSubject.mandate.mandatee as EmployeeMandatee)).toEqual({
        firstName: 'Alice',
        lastName: 'Wonder',
        email: 'alice@wonder.land',
        nationality: 'GB'
      });

      // Power array normalitzat
      expect(out.credentialSubject.mandate.power).toEqual<Power[]>([
        { action: 'a1', domain: 'd1', function: 'f1', type: 't1' },
        { action: 'a2', domain: 'd2', function: 'f2', type: 't2' }
      ]);

      // L'input original no s'ha mutat
      expect((input.credentialSubject.mandate.mandatee as any).first_name).toBeDefined();
      expect((input.credentialSubject.mandate.power as any[])[0]).toHaveProperty('tmf_domain');
    });

    it('normalitza un LEARCredentialMachine: només power', () => {
      const rawPowers: any[] = [
        { tmf_action: 'mx', tmf_domain: 'my', tmf_function: 'mf', tmf_type: 'mt' }
      ];
      const input: LEARCredentialMachine = {
        id: '2',
        type: ['LEARCredentialMachine'],
        description: 'desc',
        credentialSubject: {
          mandate: {
            id: 'm2',
            life_span: {} as any,
            mandatee: {
              id: 'man2',
              serviceName: 'svc',
              serviceType: 'type',
              version: 'v1',
              domain: 'dom',
              ipAddress: '127.0.0.1',
              description: 'desc',
              contact: { email: 'e', phone: 'p' }
            } as any,
            mandator: {} as any,
            power: rawPowers as any,
            signer: {} as any
          }
        },
        issuer: {} as any,
        validFrom: '2025-01-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z'
      };

      const out = normalizer.normalizeLearCredential(input as any) as any;

      // No s'ha tocat el mandatee
      expect(out.credentialSubject.mandate.mandatee).toEqual(input.credentialSubject.mandate.mandatee);

      // S'ha normalitzat el power
      expect(out.credentialSubject.mandate.power).toEqual<Power[]>([
        { action: 'mx', domain: 'my', function: 'mf', type: 'mt' }
      ]);
    });

    it('no canvia power si no és array', () => {
      const input: any = {
        type: ['LEARCredentialEmployee'],
        credentialSubject: { mandate: { power: 'no-array' } }
      };

      const out = normalizer.normalizeLearCredential(input) as any;
      expect(out.credentialSubject.mandate.power).toBe('no-array');
    });

    it('normalitza un VerifiableCertification: mou atester → attester', () => {
      const fakeAtt: Attester = {
        id: 'a1',
        organization: 'Org',
        organizationIdentifier: 'OID',
        firstName: 'F',
        lastName: 'L',
        country: 'XX'
      };
      const input: any = {
        id: '3',
        type: ['VerifiableCertification'],
        credentialSubject: { foo: 'bar' },
        attester: fakeAtt,
        validFrom: '2025-01-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        issuer: {} as any,
        signer: {} as any
      };

      const out = normalizer.normalizeLearCredential(input as any);
      expect((out as any).attester).toEqual(fakeAtt);
      expect((out as any).atester).toBeUndefined();
      expect(out.credentialSubject).toEqual({ foo: 'bar' });
    });

    it('si no hi ha tipus rellevant retorna un clon sense canvis', () => {
      const input: any = {
        id: '4',
        type: ['GXSomethingElse'],
        issuer: 'did:elsi:VAT',
        validFrom: '2025-01-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        credentialSubject: {
          id: 'urn',
          'gx:labelLevel': 'L1',
          'gx:engineVersion': 'E1',
          'gx:rulesVersion': 'R1',
          'gx:compliantCredentials': [{ id: 'c1', type: 't1', 'gx:digestSRI': 'd1' }],
          'gx:validatedCriteria': ['v1']
        }
      };

      const out = normalizer.normalizeLearCredential(input as any);
      // Igualtat d'objecte però no mateixa referència
      expect(out).toEqual(input);
      expect(out).not.toBe(input);
    });

    it('si falta mandate dins credentialSubject i és LEARCredentialEmployee no falla', () => {
      const input: any = {
        type: ['LEARCredentialEmployee'],
        credentialSubject: { somethingElse: 123 }
      };
      expect(() => normalizer.normalizeLearCredential(input)).not.toThrow();
      const out = normalizer.normalizeLearCredential(input);
      expect(out.credentialSubject).toHaveProperty('somethingElse', 123);
    });
  });
});
