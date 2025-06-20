import { CredentialDetailsFormSchema, LearCredentialEmployeeDetailsFormSchema, LearCredentialMachineDetailsFormSchema, VerifiableCertificationDetailsFormSchema } from 'src/app/core/models/entity/lear-credential-details';

  describe('LearCredentialEmployeeDetailsFormSchema', () => {
    it('should contain mandatee, mandator, issuer and power groups', () => {
      expect(LearCredentialEmployeeDetailsFormSchema).toEqual(
        expect.objectContaining({
          mandatee: expect.any(Object),
          mandator: expect.any(Object),
          issuer: expect.any(Object),
          power: expect.any(Object)
        })
      );
    });
  
    it('should have "group" type and defined fields for mandatee and mandator', () => {
      const { mandatee, mandator } = LearCredentialEmployeeDetailsFormSchema;
  
      expect(mandatee.type).toBe('group');
      expect(mandatee.fields).toBeDefined();
      expect(mandator.type).toBe('group');
      expect(mandator.fields).toBeDefined();
    });
  
    it('should contain expected fields in mandatee', () => {
      expect(Object.keys(LearCredentialEmployeeDetailsFormSchema['mandatee'].fields!)).toEqual(
        expect.arrayContaining(['firstName', 'lastName', 'email', 'nationality'])
      );
    });
  });

describe('LearCredentialMachineDetailsFormSchema', () => {
  it('should contain mandatee, mandator, issuer and power groups', () => {
    expect(LearCredentialMachineDetailsFormSchema).toEqual(
      expect.objectContaining({
        mandatee: expect.any(Object),
        mandator: expect.any(Object),
        issuer: expect.any(Object),
        power: expect.any(Object)
      })
    );
  });

  it('should include "contact" group nested inside mandatee', () => {
    const contact = (LearCredentialMachineDetailsFormSchema['mandatee'].fields as CredentialDetailsFormSchema)['contact'];
    expect(contact).toBeDefined();
    expect(contact?.type).toBe('group');
    expect(contact?.fields).toEqual(
      expect.objectContaining({
        email: expect.any(Object),
        phone: expect.any(Object)
      })
    );
  });
});

describe('VerifiableCertificationDetailsFormSchema', () => {
    it('should contain issuer, attester, company, product and compliance groups', () => {
      expect(VerifiableCertificationDetailsFormSchema).toEqual(
        expect.objectContaining({
          issuer: expect.any(Object),
          attester: expect.any(Object),
          company: expect.any(Object),
          product: expect.any(Object),
          compliance: expect.any(Object)
        })
      );
    });
  
    it('should have empty fields for compliance (to be filled dynamically)', () => {
      const compliance = VerifiableCertificationDetailsFormSchema['compliance'];
      expect(compliance.type).toBe('group');
      expect(compliance.fields).toEqual({});
    });
  });