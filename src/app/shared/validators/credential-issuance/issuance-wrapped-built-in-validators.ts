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
        ? { required: 'error.form.required' }
        : null;
    };
  }

  public static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Validators.email(control)
        ? { email: 'error.form.email' }
        : null;
    };
  }

  public static min(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = Validators.min(min)(control);
      return result ? { min: 'error.form.min' } : null;
    };
  }

  public static max(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = Validators.max(max)(control);
      return result ? { max: 'error.form.max' } : null;
    };
  }

  public static minLength(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = Validators.minLength(minLength)(control);
      return result ? { minLength: 'error.form.minLength_' + minLength } : null;
    };
  }

  public static maxLength(maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = Validators.maxLength(maxLength)(control);
      return result ? { maxLength: 'error.form.maxLength_' + maxLength } : null;
    };
  }

  public static pattern(pattern:RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = Validators.pattern(pattern)(control);
      return result ? { pattern: 'error.form.pattern' } : null;
    };
  }
}