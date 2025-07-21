import { TestBed } from '@angular/core/testing';
import {
  CREDENTIAL_SCHEMA_BUILDERS,
  IssuanceSchemaBuilder,
} from './issuance-schema-builder';
import {  } from 'src/app/core/models/entity/lear-credential-issuance';
import { IssuanceCredentialType } from 'src/app/core/models/entity/lear-credential';

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

  it('getIssuanceFormSchema should return the first schema from the builder', () => {
    builderMock.getSchema.mockReturnValue(['formSchemaValue', 'powerSchemaValue']);
    expect(service.getIssuanceFormSchema(TYPE)).toEqual('formSchemaValue');
  });

  it('getIssuancePowerFormSchema should return the second schema from the builder', () => {
    builderMock.getSchema.mockReturnValue(['formSchemaValue', 'powerSchemaValue']);
    expect(service.getIssuancePowerFormSchema(TYPE)).toEqual('powerSchemaValue');
  });

  it('should throw an error if there is no builder for the given type', () => {
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

    it('when asSigner=false should separate formSchema and staticSchema correctly', () => {
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

      // Only the normal field remains in the form schema when not signing
      expect(formSchema).toEqual([
        fieldNormal,
      ]);
      expect(staticSchema).toEqual({ k: 'v', k2: 'v2' });
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    });

    it('when asSigner=true should include only pref_side in formSchema and only process side', () => {
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

      // Only the normal and pref_side fields appear when signing, side fields are processed statically
      expect(formSchema).toEqual([
        fieldNormal,
        fieldPrefSideGood,
        fieldPrefSideBad,
        fieldPrefSideNoGetter,
      ]);
      expect(staticSchema).toEqual({ k: 'v' });
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
  });
});
