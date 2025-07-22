import { TestBed } from '@angular/core/testing';
import {
  CREDENTIAL_SCHEMA_BUILDERS,
  IssuanceSchemaBuilder,
} from './issuance-schema-builder';
import {
  CredentialIssuanceFormFieldSchema,
  IssuanceStaticDataSchema,
} from 'src/app/core/models/entity/lear-credential-issuance';
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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getIssuanceFormSchema', () => {
    it('delegates to the correct builder.getSchema()', () => {
      const fakeSchema: CredentialIssuanceFormFieldSchema[] = [
        { key: 'a', type: 'control', controlType: 'text' },
      ];
      builderMock.getSchema.mockReturnValue(fakeSchema);

      const result = service.getIssuanceFormSchema(TYPE);
      expect(builderMock.getSchema).toHaveBeenCalled();
      expect(result).toBe(fakeSchema);
    });

    it('throws if no builder for type', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: CREDENTIAL_SCHEMA_BUILDERS, useValue: [] },
          IssuanceSchemaBuilder,
        ],
      });
      const svc = TestBed.inject(IssuanceSchemaBuilder);
      expect(() => svc.getIssuanceFormSchema(TYPE)).toThrowError(
        `No schema builder for ${TYPE}`
      );
    });
  });

  describe('schemasBuilder()', () => {
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });
    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    const baseField = (over: Partial<CredentialIssuanceFormFieldSchema>) =>
      ({
        key: 'k',
        type: 'control',
        controlType: 'text',
        display: 'main',
        validators: [],
        hint: 'h',
        classes: 'c1 c2',
        multiOptions: [{ label: 'L', value: 'V' }],
        groupFields: [],
        custom: { component: {} as any, data: { foo: 'bar' } },
        staticValueGetter: undefined,
        ...over,
      } as CredentialIssuanceFormFieldSchema);

    it('keeps a main control field intact', () => {
      const raw = [baseField({ key: 'main', display: 'main' })];
      builderMock.getSchema.mockReturnValue(raw);

      const [form, stat] = service.schemasBuilder(TYPE, false);
      expect(form).toHaveLength(1);
      expect(form[0]).toMatchObject({
        key: 'main',
        type: 'control',
        controlType: 'text',
        hint: 'h',
        classes: 'c1 c2',
      });
      expect(stat).toEqual({});
    });

    it('extracts side fields via staticValueGetter returning mandator array', () => {
      const raw = [
        baseField({
          key: 'side',
          display: 'side',
          staticValueGetter: () => ({ mandator: [{ key: 'x', value: 'y' }] }),
        }),
      ];
      builderMock.getSchema.mockReturnValue(raw);

      const [form, stat] = service.schemasBuilder(TYPE, true);
      expect(form).toHaveLength(0);
      expect(stat.mandator).toEqual([{ key: 'x', value: 'y' }]);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('extracts pref_side only when asSigner=false', () => {
      const raw = [
        baseField({
          key: 'pref',
          display: 'pref_side',
          staticValueGetter: () => ({ mandator: [{ key: 'p', value: 'q' }] }),
        }),
      ];
      builderMock.getSchema.mockReturnValue(raw);

      const [formFalse, statFalse] = service.schemasBuilder(TYPE, false);
      expect(formFalse).toHaveLength(0);
      expect(statFalse.mandator).toEqual([{ key: 'p', value: 'q' }]);

      const [formTrue, statTrue] = service.schemasBuilder(TYPE, true);
      expect(formTrue).toHaveLength(1);
      expect(statTrue).toEqual({});
    });

    it('logs warning if staticValueGetter returns null or non-object', () => {
      const raw = [
        baseField({
          key: 'bad1',
          display: 'side',
          staticValueGetter: () => null,
        }),
        baseField({
          key: 'bad2',
          display: 'side',
          staticValueGetter: () => (42 as any),
        }),
      ];
      builderMock.getSchema.mockReturnValue(raw);

      const [form, stat] = service.schemasBuilder(TYPE, false);
      expect(form).toHaveLength(0);
      expect(stat).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not get static value from field bad1')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not get static value from field bad2')
      );
    });

    it('passes through group fields without extraction', () => {
      const child = baseField({ key: 'child', display: 'main' });
      const raw = [
        {
          ...baseField({ key: 'group1', type: 'group', groupFields: [child] }),
          display: 'main',
        },
      ];
      builderMock.getSchema.mockReturnValue(raw);

      const [form, stat] = service.schemasBuilder(TYPE, false);
      expect(form).toHaveLength(1);
      const grp = form[0];
      expect(grp.type).toBe('group');
      expect(grp.groupFields).toEqual([child]);
      expect(stat).toEqual({});
    });
  });

  describe('private helpers', () => {
    it('shouldExtractStatic logic', () => {
      // @ts-ignore
      expect(service['shouldExtractStatic']({ display: 'side' }, true)).toBe(true);
      // @ts-ignore
      expect(service['shouldExtractStatic']({ display: 'pref_side' }, false)).toBe(true);
      // @ts-ignore
      expect(service['shouldExtractStatic']({ display: 'pref_side' }, true)).toBe(false);
      // @ts-ignore
      expect(service['shouldExtractStatic']({ display: 'main' }, false)).toBe(false);
    });

    it('getBuilder with no match throws', () => {
      // @ts-ignore
      expect(() => service['getBuilder']('OTHER' as any)).toThrowError(
        'No schema builder for OTHER'
      );
    });
  });
});
