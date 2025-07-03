import { AbstractControl, Validators } from "@angular/forms";
import { ExtendedValidatorFn, ValidatorEntry, ExtendedValidatorErrors } from "src/app/core/models/entity/validator-types";

export const BUILTIN_VALIDATORS_FACTORY_MAP = {
  required: (): ExtendedValidatorFn<"required"> =>
    WrappedBuiltInValidators.required(),
  email: (): ExtendedValidatorFn<"email"> =>
    WrappedBuiltInValidators.email(),
  min: (min: number): ExtendedValidatorFn<"min"> =>
    WrappedBuiltInValidators.min(min),
  max: (max: number): ExtendedValidatorFn<"max"> =>
    WrappedBuiltInValidators.max(max),
  minLength: (minLength: number): ExtendedValidatorFn<"minLength"> =>
    WrappedBuiltInValidators.minLength(minLength),
  maxLength: (maxLength: number): ExtendedValidatorFn<"maxLength"> =>
    WrappedBuiltInValidators.maxLength(maxLength),
  pattern: (pattern: RegExp): ExtendedValidatorFn<"pattern"> =>
    WrappedBuiltInValidators.pattern(pattern),
} as const;

export type BuiltinValidatorName = keyof typeof BUILTIN_VALIDATORS_FACTORY_MAP;
export type BuiltInValidatorEntry = ValidatorEntry<BuiltinValidatorName>;


export class WrappedBuiltInValidators {
  public static required(): ExtendedValidatorFn<"required"> {
    return (control: AbstractControl): ExtendedValidatorErrors<"required"> | null => {
      return Validators.required(control)
        ? { required: { value: "error.form.required" } }
        : null;
    };
  }

  public static email(): ExtendedValidatorFn<"email"> {
    return (control: AbstractControl): ExtendedValidatorErrors<"email"> | null => {
      return Validators.email(control)
        ? { email: { value: "error.form.email" } }
        : null;
    };
  }

  public static min(min: number): ExtendedValidatorFn<"min"> {
    return (control: AbstractControl): ExtendedValidatorErrors<"min"> | null => {
      return Validators.min(min)(control)
        ? { min: { value: "error.form.min", args: [min] } }
        : null;
    };
  }

  public static max(max: number): ExtendedValidatorFn<"max"> {
    return (control: AbstractControl): ExtendedValidatorErrors<"max"> | null => {
      return Validators.max(max)(control)
        ? { max: { value: "error.form.max", args: [max] } }
        : null;
    };
  }

  public static minLength(minLength: number): ExtendedValidatorFn<"minLength"> {
    return (control: AbstractControl): ExtendedValidatorErrors<"minLength"> | null => {
      return Validators.minLength(minLength)(control)
        ? { minLength: { value: "error.form.minLength", args: [minLength] } }
        : null;
    };
  }

  public static maxLength(maxLength: number): ExtendedValidatorFn<"maxLength"> {
    return (control: AbstractControl): ExtendedValidatorErrors<"maxLength"> | null => {
      return Validators.maxLength(maxLength)(control)
        ? { maxLength: { value: "error.form.maxLength", args: [maxLength] } }
        : null;
    };
  }

  public static pattern(pattern: RegExp): ExtendedValidatorFn<"pattern"> {
    return (control: AbstractControl): ExtendedValidatorErrors<"pattern"> | null => {
      return Validators.pattern(pattern)(control)
        ? { pattern: { value: "error.form.pattern" } }
        : null;
    };
  }
}
