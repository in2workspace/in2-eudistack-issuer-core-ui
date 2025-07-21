import { TestBed } from '@angular/core/testing';
import { AuthService } from 'src/app/core/services/auth.service';
import { CountryService } from 'src/app/core/services/country.service';
import { LearCredentialEmployeeSchemaBuilder } from './lear-credential-employee-issuance-schema-builder';
import { mandatorMock } from 'src/app/core/mocks/details.mock';
import { convertToOrderedArray, mandatorFieldsOrder } from '../../helpers/fields-order-helpers';

describe('LearCredentialEmployeeSchemaBuilder', () => {
  let service: LearCredentialEmployeeSchemaBuilder;
  let authServiceStub: { getRawMandator: jest.Mock };
  let countryServiceStub: { getCountriesAsSelectorOptions: jest.Mock };

  beforeEach(() => {
    authServiceStub = {
      getRawMandator: jest.fn()
    };
    countryServiceStub = {
      getCountriesAsSelectorOptions: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: CountryService, useValue: countryServiceStub },
        LearCredentialEmployeeSchemaBuilder
      ]
    });
    service = TestBed.inject(LearCredentialEmployeeSchemaBuilder);
  });

  it('should have the correct credType', () => {
    expect(service.credType).toBe('LEARCredentialEmployee');
  });

  describe('getSchema()', () => {
    it('builds form & power schemas when mandator is present', () => {
      const countriesOpts = [
        { value: 'ES', label: 'Spain' },
        { value: 'US', label: 'United States' }
      ];
      countryServiceStub.getCountriesAsSelectorOptions.mockReturnValue(countriesOpts);
      authServiceStub.getRawMandator.mockReturnValue(mandatorMock);

      const [form, power] = service.getSchema();

      // --- form schema checks ---
      // 1) Two top-level groups: 'mandatee' and 'mandator'
      expect(form.map((f: any) => f.key)).toEqual(['mandatee', 'mandator']);

      // 2) 'mandatee' group has a 'nationality' selector with our countriesOpts
      const mandateeGroup = form.find((f: any) => f.key === 'mandatee')!;
      const nationalityField = (mandateeGroup as any).groupFields.find((g: any) => g.key === 'nationality')!;
      expect(nationalityField.controlType).toBe('selector');
      expect(nationalityField.multiOptions).toBe(countriesOpts);

      // 3) 'mandator' group staticValueGetter returns object when getRawMandator is truthy
      const mandatorGroup = form.find((f: any) => f.key === 'mandator')!;
      const staticVal = (mandatorGroup as any).value();
      expect(staticVal).toEqual({ mandator: convertToOrderedArray(mandatorMock, mandatorFieldsOrder) });

      // --- power schema checks ---
      expect(power.power).toHaveLength(3);

      // First power entry
      expect(power.power[0]).toEqual({
        action: ['Execute'],
        function: 'Onboarding',
        isIn2Required: true
      });
      // Second power entry
      expect(power.power[1].action).toEqual(['Create', 'Update', 'Delete']);
      expect(power.power[1].function).toBe('ProductOffering');
      expect(power.power[1].isIn2Required).toBe(false);

      // Third power entry
      expect(power.power[2]).toMatchObject({
        action: ['Upload', 'Attest'],
        function: 'Certification',
        isIn2Required: true
      });
    });

    it('staticValueGetter returns null when getRawMandator is falsy', () => {
      countryServiceStub.getCountriesAsSelectorOptions.mockReturnValue([]);
      authServiceStub.getRawMandator.mockReturnValue(null);

      const [form] = service.getSchema();
      const mandatorGroup = form.find((f: any) => f.key === 'mandator')!;
      expect((mandatorGroup as any).value()).toBeNull();
    });
  });
});
