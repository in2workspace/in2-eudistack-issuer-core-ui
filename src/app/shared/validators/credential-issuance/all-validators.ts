import { CustomValidatorEntry, CustomValidatorName, CUSTOM_VALIDATORS_FACTORY_MAP } from "./custom-validators";
import { BUILTIN_VALIDATORS_FACTORY_MAP, BuiltInValidatorEntry, BuiltinValidatorName } from "./wrapped-built-in-validators";
import { AbstractControl } from "@angular/forms";


export type ValidatorEntry = BuiltInValidatorEntry | CustomValidatorEntry;
export type ValidatorName = BuiltinValidatorName | CustomValidatorName;
export type ExtendedValidatorPayload = { value:string, args?:any[]};
export type ExtendedValidatorErrors = {
  [K in ValidatorName]?: ExtendedValidatorPayload
}
export type ExtendedValidatorFn = (c:AbstractControl) => ExtendedValidatorErrors | null;
export const ALL_VALIDATORS_FACTORY_MAP: Record<ValidatorName, (...args: any[]) => ExtendedValidatorFn> = {
  ...BUILTIN_VALIDATORS_FACTORY_MAP,
  ...CUSTOM_VALIDATORS_FACTORY_MAP,
};
