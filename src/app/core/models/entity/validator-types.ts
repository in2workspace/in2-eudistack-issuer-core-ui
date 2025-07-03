import { AbstractControl } from "@angular/forms";

export type ExtendedValidatorPayload = {
  value: string;
  args?: any[];
};

export type ExtendedValidatorErrors<Name extends string = string> = {
  [K in Name]?: ExtendedValidatorPayload
};

export type ExtendedValidatorFn<Name extends string = string> =
  (c: AbstractControl) => ExtendedValidatorErrors<Name> | null;

export type ValidatorEntry<Name extends string = string> = {
  name: Name;
  args?: any[];
};
