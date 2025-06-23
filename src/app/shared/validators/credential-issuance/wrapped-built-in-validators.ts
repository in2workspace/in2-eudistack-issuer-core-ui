import { AbstractControl, Validators } from "@angular/forms";
import { ExtendedValidatorErrors, ExtendedValidatorFn } from "./all-validators";

export type BuiltInValidatorEntry = { name: BuiltinValidatorName; args?: any[] };

export const BUILTIN_VALIDATORS_FACTORY_MAP = {
  required: () => WrappedBuilInValidators.required(),
  email: () => WrappedBuilInValidators.email(),
  min: (min: number) => WrappedBuilInValidators.min(min),
  max: (max: number) => WrappedBuilInValidators.max(max),
  minLength: (minLength: number) => WrappedBuilInValidators.minLength(minLength),
  maxLength: (maxLength: number) => WrappedBuilInValidators.maxLength(maxLength),
  pattern: (pattern:RegExp) => WrappedBuilInValidators.pattern(pattern)
};

export type BuiltinValidatorName = keyof typeof BUILTIN_VALIDATORS_FACTORY_MAP;

export class WrappedBuilInValidators {
  public static required(): ExtendedValidatorFn {
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      return Validators.required(control)
        ? { required: { value: 'error.form.required'} }
        : null;
    };
  }

  public static email(): ExtendedValidatorFn {
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      return Validators.email(control)
        ? { email: { value: 'error.form.email' } }
        : null;
    };
  }

  public static min(min: number): ExtendedValidatorFn {
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const result = Validators.min(min)(control);
      return result ? { min: { value: 'error.form.min' } } : null;
    };
  }

  public static max(max: number): ExtendedValidatorFn {
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const result = Validators.max(max)(control);
      return result ? { max: { value: 'error.form.max', args: [max]} } : null;
    };
  }

  public static minLength(minLength: number): ExtendedValidatorFn {
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const result = Validators.minLength(minLength)(control);
      return result ? { minLength: { value: 'error.form.minLength', args:[minLength] } } : null;
    };
  }

  public static maxLength(maxLength: number): ExtendedValidatorFn {
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const result = Validators.maxLength(maxLength)(control);
      return result ? { maxLength: { value: 'error.form.maxLength', args:[maxLength] }} : null;
    };
  }

  public static pattern(pattern:RegExp): ExtendedValidatorFn {
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const result = Validators.pattern(pattern)(control);
      return result ? { pattern: { value: 'error.form.pattern' }} : null;
    };
  }
}