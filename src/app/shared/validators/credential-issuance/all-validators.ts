import { ValidatorEntry, ExtendedValidatorFn } from "src/app/core/models/entity/validator-types";
import { CustomValidatorName, CUSTOM_VALIDATORS_FACTORY_MAP } from "./custom-validators";
import { BuiltinValidatorName, BUILTIN_VALIDATORS_FACTORY_MAP } from "./wrapped-built-in-validators";


export type ValidatorName = BuiltinValidatorName | CustomValidatorName;
export type ValidatorEntryUnion = 
  ValidatorEntry<BuiltinValidatorName> | ValidatorEntry<CustomValidatorName>;

export const ALL_VALIDATORS_FACTORY_MAP: Record<
  ValidatorName,
  (...args: any[]) => ExtendedValidatorFn<ValidatorName>
> = {
  ...BUILTIN_VALIDATORS_FACTORY_MAP,
  ...CUSTOM_VALIDATORS_FACTORY_MAP,
};
