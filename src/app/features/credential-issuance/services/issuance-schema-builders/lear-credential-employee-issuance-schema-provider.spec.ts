import { TestBed } from '@angular/core/testing';
import { AuthService } from 'src/app/core/services/auth.service';
import { CountryService } from 'src/app/shared/services/country.service';
import * as fieldsHelpers from '../../helpers/fields-order-helpers';
import {
  firstNameField,
  lastNameField,
  emailField,
  organizationField,
  organizationIdentifierField,
  serialNumberField,
} from './common-issuance-schema-fields';
import { IssuancePowerComponent } from '../../components/power/issuance-power.component';
import { CredentialIssuanceTypedViewModelSchema } from 'src/app/core/models/entity/lear-credential-issuance';
import { LearCredentialEmployeeSchemaProvider } from './lear-credential-employee-issuance-schema-provider';

describe('LearCredentialEmployeeSchemaProvider', () => {
  let service: LearCredentialEmployeeSchemaProvider;
  let authMock: jest.Mocked<AuthService>;
  let countryMock: jest.Mocked<CountryService>;
  const fakeCountries = [{ label: 'C', value: 'c' }];

  const fakeMandatorRaw: Record<string, string> = {};
  for (const k of fieldsHelpers.employeeMandatorFieldsOrder) {
    fakeMandatorRaw[k] = `val-${k}`;
  }

  beforeEach(() => {
    authMock = {
      getRawMandator: jest.fn(),
    } as any;

    countryMock = {
      getCountriesAsSelectorOptions: jest.fn().mockReturnValue(fakeCountries),
    } as any;

    jest
      .spyOn(fieldsHelpers, 'convertToOrderedArray')
      .mockImplementation((obj: any, order: any[]) =>
        order
          .filter((k: any) => obj[k] != null)
          .map((k: any) => ({ key: k, value: obj[k] }))
      );

    TestBed.configureTestingModule({
      providers: [
        LearCredentialEmployeeSchemaProvider,
        { provide: AuthService, useValue: authMock },
        { provide: CountryService, useValue: countryMock },
      ],
    });

    service = TestBed.inject(LearCredentialEmployeeSchemaProvider);
  });

  describe('getSchema()', () => {
    let schema: CredentialIssuanceTypedViewModelSchema<'LEARCredentialEmployee'>;

    beforeEach(() => {
      schema = service.getSchema();
    });

    it('should include mandatee group with correct fields', () => {
      const mand = schema.schema.find(f => f.key === 'mandatee');
      expect(mand).toBeDefined();
      expect(mand?.type).toBe('group');
      expect(mand?.display).toBe('main');

      const [fn, ln, email, nat] = mand!.groupFields;
      expect(fn).toEqual(firstNameField);
      expect(ln).toEqual(lastNameField);
      expect(email).toEqual(emailField);
    });

    // todo test
    // it('should include mandator group with staticValueGetter and ordered fields', () => {
    //   const mandator = schema.schema.find(f => f.key === 'mandator');
    //   expect(mandator).toBeDefined();
    //   expect(mandator?.display).toBe('pref_side');
    //   expect(typeof mandator?.staticValueGetter).toBe('function');

    //   // quan authService retorna null
    //   authMock.getRawMandator.mockReturnValue(null);
    //   expect(mandator?.staticValueGetter!()).toBeNull();

    //   // quan authService retorna l'objecte complet
    //   authMock.getRawMandator.mockReturnValue(fakeMandatorRaw as any);
    //   const staticData = mandator?.staticValueGetter!();
    //   expect(staticData).toHaveProperty('mandator');
    //   expect(staticData!.mandator).toEqual(
    //     fieldsHelpers.employeeMandatorFieldsOrder.map(k => ({ key: k, value: fakeMandatorRaw[k] }))
    //   );

    //   // comprovem l'ordre i contingut de groupFields
    //   const fields = mandator?.groupFields!;
    //   expect(fields[0]).toEqual(firstNameField);
    //   expect(fields[1]).toEqual(lastNameField);
    //   expect(fields[2]).toMatchObject({ ...emailField, key: 'emailAddress' });
    //   expect(fields[3]).toEqual(serialNumberField);
    //   expect(fields[4]).toEqual(organizationField);
    //   expect(fields[5]).toEqual(organizationIdentifierField);

    //   const countryField = fields[6];
    //   expect(countryField).toMatchObject({
    //     key: 'country',
    //     controlType: 'selector',
    //     multiOptions: fakeCountries,
    //     validators: [{ name: 'required' }],
    //   });
    // });

    it('should include power group with IssuancePowerComponent i and correct data', () => {
      const power = schema.schema.find(f => f.key === 'power');
      expect(power).toBeDefined();
      expect(power?.type).toBe('group');
      expect(power?.groupFields).toEqual([]);

      expect(power?.custom).toMatchObject({
        component: IssuancePowerComponent,
        data: [
          {
            action: ['Execute'],
            function: 'Onboarding',
            isIn2Required: true,
          },
          {
            action: ['Create', 'Update', 'Delete'],
            function: 'ProductOffering',
            isIn2Required: false,
          },
          {
            action: ['Upload', 'Attest'],
            function: 'Certification',
            isIn2Required: true,
          },
        ],
      });
    });
  });
});
