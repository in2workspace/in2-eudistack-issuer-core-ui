import { TestBed } from '@angular/core/testing';
import {
  CREDENTIAL_SCHEMA_BUILDERS,
  IssuanceSchemaBuilder,
} from './issuance-schema-builder'; // ajusta la ruta si cal
import { IssuanceCredentialType } from 'src/app/core/models/entity/lear-credential-issuance';

describe('IssuanceSchemaBuilder', () => {
  let service: IssuanceSchemaBuilder;
  let builderMock: any;
  const TYPE = 'TEST_TYPE' as IssuanceCredentialType;

  beforeEach(() => {
    builderMock = {
      credType: TYPE,
      getSchema: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CREDENTIAL_SCHEMA_BUILDERS, useValue: [builderMock] },
        IssuanceSchemaBuilder,
      ],
    });
    service = TestBed.inject(IssuanceSchemaBuilder);
  });

  it('getIssuanceFormSchema ha de retornar el primer schema del builder', () => {
    builderMock.getSchema.mockReturnValue(['formSchemaValue', 'powerSchemaValue']);
    expect(service.getIssuanceFormSchema(TYPE)).toEqual('formSchemaValue');
  });

  it('getIssuancePowerFormSchema ha de retornar el segon schema del builder', () => {
    builderMock.getSchema.mockReturnValue(['formSchemaValue', 'powerSchemaValue']);
    expect(service.getIssuancePowerFormSchema(TYPE)).toEqual('powerSchemaValue');
  });

  it('ha de llençar error si no hi ha builder pel tipus', () => {
    expect(() => service.getIssuanceFormSchema('OTHER' as IssuanceCredentialType))
      .toThrowError('No schema builder for OTHER');
    expect(() => service.getIssuancePowerFormSchema('OTHER' as IssuanceCredentialType))
      .toThrowError('No schema builder for OTHER');
  });

  describe('schemasBuilder', () => {
    const fieldNormal = { display: 'normal', name: 'f1' };
    const fieldSideGood = {
      display: 'side',
      name: 'f2',
      staticValueGetter: () => ({ k: 'v' }),
    };
    const fieldSideBad = {
      display: 'side',
      name: 'f3',
      staticValueGetter: () => 'oops',
    };
    const fieldPrefSideGood = {
      display: 'pref_side',
      name: 'f4',
      staticValueGetter: () => ({ k2: 'v2' }),
    };
    const fieldPrefSideBad = {
      display: 'pref_side',
      name: 'f5',
      staticValueGetter: () => 'bad',
    };
    const fieldPrefSideNoGetter = { display: 'pref_side', name: 'f6' };

    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('com asSigner=false ha de separar formSchema i staticSchema correctament', () => {
      const rawSchema = [
        fieldNormal,
        fieldSideGood,
        fieldSideBad,
        fieldPrefSideGood,
        fieldPrefSideBad,
        fieldPrefSideNoGetter,
      ];
      builderMock.getSchema.mockReturnValue([rawSchema, []]);

      const [formSchema, staticSchema] = service.schemasBuilder(TYPE, false);

      expect(formSchema).toEqual([
        fieldNormal,
        fieldSideGood,
        fieldSideBad,
        fieldPrefSideNoGetter,
      ]);
      expect(staticSchema).toEqual({ k: 'v', k2: 'v2' });
      // s'han de cridar 2 vegades console.warn (per fieldSideBad i fieldPrefSideBad)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    });

    it('com asSigner=true inclou pref_side al formSchema i només processa side', () => {
      const rawSchema = [
        fieldNormal,
        fieldSideGood,
        fieldSideBad,
        fieldPrefSideGood,
        fieldPrefSideBad,
        fieldPrefSideNoGetter,
      ];
      builderMock.getSchema.mockReturnValue([rawSchema, []]);

      const [formSchema, staticSchema] = service.schemasBuilder(TYPE, true);

      expect(formSchema).toEqual([
        fieldNormal,
        fieldSideGood,
        fieldSideBad,
        fieldPrefSideGood,
        fieldPrefSideBad,
        fieldPrefSideNoGetter,
      ]);
      expect(staticSchema).toEqual({ k: 'v' });
      // només per fieldSideBad
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
  });
});
