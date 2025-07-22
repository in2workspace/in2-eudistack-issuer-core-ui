import { TestBed } from '@angular/core/testing';
import { LearCredentialMachineIssuanceSchemaBuilder } from './lear-credential-machine-issuance-schema-builder';
import { AuthService } from 'src/app/core/services/auth.service';
import { CountryService } from 'src/app/core/services/country.service';
import * as fieldsHelpers from '../../helpers/fields-order-helpers';
import {
  firstNameField,
  lastNameField,
  organizationField,
  organizationIdentifierField,
  serialNumberField,
} from './common-issuance-schema-fields';
import { KeyGeneratorComponent } from '../../components/key-generator/key-generator.component';
import { IssuancePowerComponent } from '../../components/power/issuance-power.component';

describe('LearCredentialMachineIssuanceSchemaBuilder', () => {
  let service: LearCredentialMachineIssuanceSchemaBuilder;
  let authMock: jest.Mocked<AuthService>;
  let countryMock: jest.Mocked<CountryService>;
  const fakeCountries = [{ label: 'C', value: 'c' }];

  // build a fake mandator object whose keys cover mandatorFieldsOrder
  const fakeMandatorRaw: Record<string, string> = {};
  for (const k of fieldsHelpers.mandatorFieldsOrder) {
    fakeMandatorRaw[k] = `val-${k}`;
  }

  beforeEach(() => {
    authMock = {
      getRawMandator: jest.fn(),
    } as any;

    countryMock = {
      getCountriesAsSelectorOptions: jest.fn().mockReturnValue(fakeCountries),
    } as any;

    // mock convertToOrderedArray to respect any[]
    jest
      .spyOn(fieldsHelpers, 'convertToOrderedArray')
      .mockImplementation((obj: any, order: any[]) =>
        order
          .filter((k: any) => obj[k] != null)
          .map((k: any) => ({ key: k, value: obj[k] }))
      );

    TestBed.configureTestingModule({
      providers: [
        LearCredentialMachineIssuanceSchemaBuilder,
        { provide: AuthService, useValue: authMock },
        { provide: CountryService, useValue: countryMock },
      ],
    });

    service = TestBed.inject(LearCredentialMachineIssuanceSchemaBuilder);
  });

  it('exposes the correct credType', () => {
    expect(service.credType).toBe('LEARCredentialMachine');
  });

  describe('getSchema()', () => {
    let schema: any[];

    beforeEach(() => {
      schema = service.getSchema();
    });

    it('includes the keys group with KeyGeneratorComponent', () => {
      const keysGroup = schema.find(f => f.key === 'keys');
      expect(keysGroup).toBeDefined();
      expect(keysGroup.type).toBe('group');
      expect(keysGroup.display).toBe('main');
      expect(keysGroup.custom?.component).toBe(KeyGeneratorComponent);

      const didField = keysGroup.groupFields[0];
      expect(didField).toMatchObject({
        key: 'didKey',
        type: 'control',
        validators: [{ name: 'required' }],
      });
    });

    it('includes the mandatee group with domain and ipAddress fields', () => {
      const mand = schema.find(f => f.key === 'mandatee');
      expect(mand).toBeDefined();
      expect(mand.groupFields).toHaveLength(2);

      const [domain, ip] = mand.groupFields;
      expect(domain).toMatchObject({
        key: 'domain',
        controlType: 'text',
        validators: [{ name: 'required' }, { name: 'isDomain' }],
      });
      expect(ip).toMatchObject({
        key: 'ipAddress',
        validators: [{ name: 'isIP' }],
      });
    });

    it('includes the mandator group and staticValueGetter behavior', () => {
      const mandator = schema.find(f => f.key === 'mandator');
      expect(mandator).toBeDefined();
      expect(mandator.display).toBe('pref_side');
      expect(typeof mandator.staticValueGetter).toBe('function');

      // when authService returns null
      authMock.getRawMandator.mockReturnValue(null);
      expect(mandator.staticValueGetter!()).toBeNull();

      // when authService returns a full object
      authMock.getRawMandator.mockReturnValue(fakeMandatorRaw as any);
      const staticData = mandator.staticValueGetter!();
      expect(staticData).toHaveProperty('mandator');
      // should match our fakeMandatorRaw keys in the ordered array
      expect(staticData!.mandator).toEqual(
        fieldsHelpers.mandatorFieldsOrder.map(k => ({ key: k, value: fakeMandatorRaw[k] }))
      );

      // ensure the groupFields order and contents
      const fields = mandator.groupFields;
      expect(fields[0]).toEqual(firstNameField);
      expect(fields[1]).toEqual(lastNameField);
      expect(fields[2]).toEqual(serialNumberField);
      expect(fields[3]).toEqual(organizationField);
      expect(fields[4]).toEqual(organizationIdentifierField);

      const countryField = fields[5];
      expect(countryField).toMatchObject({
        key: 'country',
        controlType: 'selector',
        multiOptions: fakeCountries,
        validators: [{ name: 'required' }],
      });
    });

    it('includes the power group with IssuancePowerComponent', () => {
      const power = schema.find(f => f.key === 'power');
      expect(power).toBeDefined();
      expect(power.type).toBe('group');
      expect(power.groupFields).toEqual([]);
      expect(power.custom).toMatchObject({
        component: IssuancePowerComponent,
        data: [
          {
            action: ['Execute'],
            function: 'Onboarding',
            isIn2Required: false,
          },
        ],
      });
    });
  });
});
