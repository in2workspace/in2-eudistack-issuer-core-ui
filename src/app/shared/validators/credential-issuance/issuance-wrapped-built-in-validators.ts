import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export type BuiltInValidatorEntry = { name: BuiltinValidatorName; args?: any[] };

export const BUILTIN_VALIDATORS_FACTORY_MAP: Record<
  string,
  (...args: any[]) => ValidatorFn
> = {
  required: () => WrappedValidators.required(),
  email: () => WrappedValidators.email(),
  min: (min: number) => WrappedValidators.min(min),
  max: (max: number) => WrappedValidators.max(max),
  minLength: (minLength: number) => WrappedValidators.minLength(minLength),
  maxLength: (maxLength: number) => WrappedValidators.maxLength(maxLength),
  pattern: (pattern:RegExp) => WrappedValidators.pattern(pattern)
};

export type BuiltinValidatorName = keyof typeof BUILTIN_VALIDATORS_FACTORY_MAP;

export class WrappedValidators {
  public static required(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Validators.required(control)
        ? { required: 'Aquest camp és obligatori' }
        : null;
    };
  }

  public static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Validators.email(control)
        ? { email: 'El correu no és vàlid' }
        : null;
    };
  }

  public static min(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = Validators.min(min)(control);
      return result ? { min: `El valor mínim és ${min}` } : null;
    };
  }

  public static max(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = Validators.max(max)(control);
      return result ? { max: `El valor màxim és ${max}` } : null;
    };
  }

  public static minLength(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = Validators.minLength(minLength)(control);
      return result ? { minLength: `Longitud mínima: ${minLength}` } : null;
    };
  }

  public static maxLength(maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = Validators.maxLength(maxLength)(control);
      return result ? { maxLength: `Longitud màxima: ${maxLength}` } : null;
    };
  }

  public static pattern(pattern:RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = Validators.pattern(pattern)(control);
      return result ? { pattern: `Invaldi pattern` } : null;
    };
  }
}