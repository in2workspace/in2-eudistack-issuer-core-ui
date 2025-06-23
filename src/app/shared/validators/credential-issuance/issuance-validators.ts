import { BUILTIN_VALIDATORS_FACTORY_MAP, BuiltInValidatorEntry, BuiltinValidatorName } from "./issuance-wrapped-built-in-validators";
import { CUSTOM_VALIDATORS_FACTORY_MAP, CustomValidatorEntry, CustomValidatorName } from "./issuance-custom-validators";
import { AbstractControl } from "@angular/forms";


export type ValidatorEntry = BuiltInValidatorEntry | CustomValidatorEntry;
export type ValidatorName = BuiltinValidatorName | CustomValidatorName;
export type ExtendedValidatorPayload = {value:string, args?:[]};
export type ExtendedValidatorFn = (c:AbstractControl) => Record<string, ExtendedValidatorPayload> | null;
export const ALL_VALIDATORS_FACTORY_MAP: Record<ValidatorName, (...args: any[]) => ExtendedValidatorFn> = {
  ...BUILTIN_VALIDATORS_FACTORY_MAP,
  ...CUSTOM_VALIDATORS_FACTORY_MAP,
};
