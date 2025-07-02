import { TestBed } from '@angular/core/testing';
import { LearCredentialMachineIssuanceSchemaBuilder } from './lear-credential-machine-issuance-schema-builder'; // ajusta la ruta si cal
import { AuthService } from 'src/app/core/services/auth.service';
import { CountryService } from 'src/app/core/services/country.service';

describe('LearCredentialMachineIssuanceSchemaBuilder', () => {
  let service: LearCredentialMachineIssuanceSchemaBuilder;
  let authServiceStub: { getRawMandator: jest.Mock };
  let countryServiceStub: { getCountriesAsSelectorOptions: jest.Mock };

  beforeEach(() => {
    authServiceStub = { getRawMandator: jest.fn() };
    countryServiceStub = { getCountriesAsSelectorOptions: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: CountryService, useValue: countryServiceStub },
        LearCredentialMachineIssuanceSchemaBuilder,
      ],
    });
    service = TestBed.inject(LearCredentialMachineIssuanceSchemaBuilder);
  });

  it('should have the correct credType', () => {
    expect(service.credType).toBe('LEARCredentialMachine');
  });

  describe('getSchema()', () => {
    const mockCountries = [
      { value: 'FR', label: 'France' },
      { value: 'DE', label: 'Germany' },
    ];

    beforeEach(() => {
      countryServiceStub.getCountriesAsSelectorOptions.mockReturnValue(mockCountries);
    });

    it('builds form & power schemas when mandator is present', () => {
      authServiceStub.getRawMandator.mockReturnValue('MANDATOR_ID');

      const [form, power] = service.getSchema();

      // Top-level groups
      expect(form.map(f => f.key)).toEqual(['mandatee', 'mandator']);

      // Mandatee group
      const mandatee = form.find(f => f.key === 'mandatee')!;
      expect(mandatee.type).toBe('group');
      const mf = (mandatee as any).groupFields;
      expect(mf.map((g: any) => g.key)).toEqual(['domain', 'ipAddress']);

      // domain field
      const domainField = mf.find((g: any) => g.key === 'domain')!;
      expect(domainField.controlType).toBe('text');
      expect(domainField.validators.map((v: any) => v.name)).toEqual([
        'required',
        'isDomain',
      ]);

      // ipAddress field
      const ipField = mf.find((g: any) => g.key === 'ipAddress')!;
      expect(ipField.controlType).toBe('text');
      expect(ipField.validators.map((v: any) => v.name)).toEqual(['isIP']);

      // Mandator group
      const mandator = form.find(f => f.key === 'mandator')!;
      expect(mandator.type).toBe('group');
      // staticValueGetter returns object
      expect((mandator as any).staticValueGetter()).toEqual({ mandator: 'MANDATOR_ID' });

      const ag = (mandator as any).groupFields;
      expect(ag.map((g: any) => g.key)).toEqual([
        'firstName',
        'lastName',
        'serialNumber',
        'organization',
        'organizationIdentifier',
        'country',
      ]);

      // country selector options
      const countryField = ag.find((g: any) => g.key === 'country')!;
      expect(countryField.controlType).toBe('selector');
      expect(countryField.multiOptions).toBe(mockCountries);
      expect(countryField.validators.map((v: any) => v.name)).toEqual(['required']);

      // Power schema
      expect(power.power).toHaveLength(1);
      expect(power.power[0]).toEqual({
        action: ['Execute'],
        function: 'Onboarding',
        isIn2Required: true,
      });
    });

    it('staticValueGetter returns null when getRawMandator is falsy', () => {
      authServiceStub.getRawMandator.mockReturnValue(null);

      const [form] = service.getSchema();
      const mandator = form.find(f => f.key === 'mandator')!;
      expect((mandator as any).staticValueGetter()).toBeNull();
    });
  });
});
