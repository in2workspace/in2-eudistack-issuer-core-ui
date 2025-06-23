import { AbstractControl } from "@angular/forms";
import { ExtendedValidatorErrors, ExtendedValidatorFn } from "./all-validators";

export type CustomValidatorEntry = { name: CustomValidatorName; args?: any[] };

//todo retrieve concrete invalid patterns messages from form-credential component
export class CustomValidators {

  public static isDomain(): ExtendedValidatorFn {
    const domainRegex =
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const value = control.value;
      // if (typeof value !== 'string') return { isDomain: 'Value must be a string' };
      return domainRegex.test(value) ? null : { isDomain: { value: 'error.form.domain' }};
    };
  }

  public static isIP(): ExtendedValidatorFn {
    const ipv4 =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    const ipv6 =
      /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|::1)$/;
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const value = control.value;
      if (typeof value !== 'string') return { isIP: { value: 'Value must be a string' }};
      return ipv4.test(value) || ipv6.test(value) ? null : { isIP: {value: 'error.form.ip' }};
    };
  }

  public static customEmail(): ExtendedValidatorFn {
    const emailPattern = 
  /^[a-zA-Z0-9](?:[a-zA-Z0-9+_-]|(?:\.[a-zA-Z0-9+_-]))*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]+$/;


    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const email = control.value;
    
      if (!email || typeof email !== 'string') {
        return null;
      }
    
      if (!emailPattern.test(email)) {
        return { customEmail: {value: 'error.form.email.invalid'} };
      }
    
      const [localPart, domain] = email.split('@');

      if (localPart.length > 64) {
        return { customEmail: { value: 'error.form.email.local_part_max' }};
      }

      if (domain.length > 255) {
        return { customEmail: { value: 'error.form.email.domain_part_max' }};
      }
    
      const domainParts = domain.split('.');
    
      const mainDomain = domainParts.slice(0, -1).join('.');
      if (mainDomain.length < 2) {
        return { customEmail: { value: 'error.form.email.main_domain_part_min' }};
      }
    
      const topLevelDomain = domainParts[domainParts.length - 1];
      if (topLevelDomain.length < 2) {
        return { customEmail: { value: 'error.form.email.top_level_domain_part_min' }};
      }
    
      return null; 
    }
  }

  public static unicode(): ExtendedValidatorFn{
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const pattern = /^[A-Za-zÀ-ÿ'’ -]+$/;
      const value = control.value;

      if (!value) {
        return null;
      }

      const isValid = pattern.test(value);
      return isValid ? null : { unicode: { value: 'error.form.invalid_character' }};
    }
  }

  public static orgIdentifier(): ExtendedValidatorFn{
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
        const pattern = /^[a-zA-Z0-9]+$/;
        const value = control.value;

        if (!value) {
          return null;
        }

        if (value.toLowerCase().startsWith('vat')) {
          return { orgIdentifier: { value: 'error.form.org_id_startsWithVAT' }};
        }
        

        const isValid = pattern.test(value);
        return isValid ? null : { orgIdentifier: { value: 'error.form.pattern' }};
      }
  }

  public static orgName(): ExtendedValidatorFn{
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const pattern = /^[\p{Script=Latin}\p{M}0-9'&\-,.()/ ]+$/u;
      const value = control.value;

      if (!value) {
        return null;
      }

      const isValid = pattern.test(value);
      return isValid ? null : { orgName: { value: 'error.form.pattern' }};
    }
  }

}

export const CUSTOM_VALIDATORS_FACTORY_MAP = {
  isDomain: CustomValidators.isDomain,
  isIP: CustomValidators.isIP,
  customEmail: CustomValidators.customEmail,
  unicode: CustomValidators.unicode,
  orgIdentifier: CustomValidators.orgIdentifier,
  orgName: CustomValidators.orgName
} as const;

export type CustomValidatorName = keyof typeof CUSTOM_VALIDATORS_FACTORY_MAP;



