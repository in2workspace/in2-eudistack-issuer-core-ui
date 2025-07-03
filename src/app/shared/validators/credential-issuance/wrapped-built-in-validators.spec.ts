import { FormControl } from '@angular/forms';
import { BUILTIN_VALIDATORS_FACTORY_MAP, WrappedBuiltInValidators } from './wrapped-built-in-validators';


describe('WrappedBuiltInValidators', () => {
  describe('required', () => {
    const validator = WrappedBuiltInValidators.required();

    it('ha de donar error quan el valor és buit o null', () => {
      expect(validator(new FormControl(''))).toEqual({
        required: { value: 'error.form.required' },
      });
      expect(validator(new FormControl(null as any))).toEqual({
        required: { value: 'error.form.required' },
      });
    });

    it('ha de passar quan hi ha valor', () => {
      expect(validator(new FormControl('hola'))).toBeNull();
      expect(validator(new FormControl(0 as any))).toBeNull();
    });
  });

  describe('email', () => {
    const validator = WrappedBuiltInValidators.email();

    it('ha de donar error per correus invàlids', () => {
      expect(validator(new FormControl('no-email'))).toEqual({
        email: { value: 'error.form.email' },
      });
      expect(validator(new FormControl('user@'))).toEqual({
        email: { value: 'error.form.email' },
      });
    });

    it('ha de passar per correus vàlids', () => {
      expect(validator(new FormControl('user@example.com'))).toBeNull();
      expect(validator(new FormControl('a.b@dom.ain'))).toBeNull();
    });
  });

  describe('min', () => {
    const validator = WrappedBuiltInValidators.min(5);

    it('ha de donar error si el valor és menor que el mínim', () => {
      expect(validator(new FormControl(3))).toEqual({
        min: { value: 'error.form.min', args:[5] },
      });
    });

    it('ha de passar si el valor és >= mínim', () => {
      expect(validator(new FormControl(5))).toBeNull();
      expect(validator(new FormControl(10))).toBeNull();
    });
  });

  describe('max', () => {
    const validator = WrappedBuiltInValidators.max(10);

    it('ha de donar error si el valor excedeix el màxim', () => {
      expect(validator(new FormControl(11))).toEqual({
        max: { value: 'error.form.max', args: [10] },
      });
    });

    it('ha de passar si el valor és <= màxim', () => {
      expect(validator(new FormControl(10))).toBeNull();
      expect(validator(new FormControl(0))).toBeNull();
    });
  });

  describe('minLength', () => {
    const validator = WrappedBuiltInValidators.minLength(3);

    it('ha de donar error si la longitud és menors que el mínim', () => {
      expect(validator(new FormControl('hi'))).toEqual({
        minLength: { value: 'error.form.minLength', args: [3] },
      });
    });

    it('ha de passar si la longitud és >= mínim', () => {
      expect(validator(new FormControl('hey'))).toBeNull();
      expect(validator(new FormControl('hola!'))).toBeNull();
    });
  });

  describe('maxLength', () => {
    const validator = WrappedBuiltInValidators.maxLength(5);

    it('ha de donar error si la longitud excedeix el màxim', () => {
      expect(validator(new FormControl('massa llarg'))).toEqual({
        maxLength: { value: 'error.form.maxLength', args: [5] },
      });
    });

    it('ha de passar si la longitud és <= màxim', () => {
      expect(validator(new FormControl('curt'))).toBeNull();
      expect(validator(new FormControl('12345'))).toBeNull();
    });
  });

  describe('pattern', () => {
    const regex = /^[0-9]+$/;
    const validator = WrappedBuiltInValidators.pattern(regex);

    it('ha de donar error si no coincideix amb el patró', () => {
      expect(validator(new FormControl('abc'))).toEqual({
        pattern: { value: 'error.form.pattern' },
      });
    });

    it('ha de passar si coincideix amb el patró', () => {
      expect(validator(new FormControl('1234'))).toBeNull();
      expect(validator(new FormControl('0'))).toBeNull();
    });
  });
});

describe('BUILTIN_VALIDATORS_FACTORY_MAP (comportament)', () => {
  const sampleTests: {
    name: keyof typeof BUILTIN_VALIDATORS_FACTORY_MAP;
    args: any[];
    validValue: any;
    invalidValue: any;
    expectedErrorKey: string;
  }[] = [
    {
      name: 'required',
      args: [],
      validValue: 'foo',
      invalidValue: '',
      expectedErrorKey: 'required',
    },
    {
      name: 'email',
      args: [],
      validValue: 'user@example.com',
      invalidValue: 'no-email',
      expectedErrorKey: 'email',
    },
    {
      name: 'min',
      args: [5],
      validValue: 5,
      invalidValue: 3,
      expectedErrorKey: 'min',
    },
    {
      name: 'max',
      args: [10],
      validValue: 10,
      invalidValue: 20,
      expectedErrorKey: 'max',
    },
    {
      name: 'minLength',
      args: [3],
      validValue: 'hey',
      invalidValue: 'hi',
      expectedErrorKey: 'minLength',
    },
    {
      name: 'maxLength',
      args: [4],
      validValue: 'test',
      invalidValue: 'longer',
      expectedErrorKey: 'maxLength',
    },
    {
      name: 'pattern',
      args: [/^[0-9]+$/],
      validValue: '1234',
      invalidValue: 'abcd',
      expectedErrorKey: 'pattern',
    },
  ];

  sampleTests.forEach(({ name, args, validValue, invalidValue, expectedErrorKey }) => {
    it(`factory map "${name}" behave same as WrappedBuiltInValidators.${name}`, () => {
      // construir validators
      const factoryFn = (BUILTIN_VALIDATORS_FACTORY_MAP as any)[name] as (...a: any[]) => any;
      const staticFn = (WrappedBuiltInValidators as any)[name] as (...a: any[]) => any;

      const validatorFromFactory = factoryFn(...args);
      const validatorStatic = staticFn(...args);

      // invalid
      const invalidCtrl = new FormControl(invalidValue as any);
      const fromFactoryError = validatorFromFactory(invalidCtrl);
      const staticError = validatorStatic(invalidCtrl);
      expect(fromFactoryError).toEqual(staticError);
      expect(fromFactoryError).toHaveProperty(expectedErrorKey);

      // valid
      const validCtrl = new FormControl(validValue as any);
      expect(validatorFromFactory(validCtrl)).toEqual(validatorStatic(validCtrl));
      expect(validatorFromFactory(validCtrl)).toBeNull();
    });
  });
});