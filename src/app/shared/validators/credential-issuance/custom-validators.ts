import { AbstractControl } from "@angular/forms";
import * as ipaddr from 'ipaddr.js';
import { ExtendedValidatorFn, ExtendedValidatorErrors } from "src/app/core/models/entity/validator-types";


export type CustomValidatorEntry = { name: CustomValidatorName; args?: any[] };

//todo decouple validation from error message
export class CustomValidators {

  public static isDomain(): ExtendedValidatorFn<"isDomain"> {
    const domainRegex =
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}$/;
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const value = control.value;
      return domainRegex.test(value) ? null : { isDomain: { value: 'error.form.domain' }};
    };
  }

public static isIP(): ExtendedValidatorFn<"isIP"> {
    return (control: AbstractControl): ExtendedValidatorErrors | null => {
      const value = control.value;

      if (value == null || value === '') {
        return null;
      }
      if (typeof value !== 'string') {
        return { isIP: { value: 'Value must be a string' } };
      }

      const valid =
        ipaddr.IPv4.isValid(value) ||
        ipaddr.IPv6.isValid(value);

      return valid
        ? null
        : { isIP: { value: 'error.form.ip' } };
    };
  }

  public static customEmail(): ExtendedValidatorFn<"customEmail"> {
    const localLabel = "(?!.*\\.\\.)" // avoid `..`
                 + "[A-Za-z0-9]" // start with alfanum
                 + "(?:[A-Za-z0-9+_-]" // alfanum o + _ -
                 + "|\\.(?=[A-Za-z0-9+_-]))*"; // or dot + valid character

    const domainLabel = "[A-Za-z0-9]" // start with alfanum
                      + "(?:[A-Za-z0-9-]*[A-Za-z0-9])?"; // can have '-' and end with alfanum

    const domainPart = `(?:${domainLabel}\\.)+`; // one or more labels + “.”

    const tld = "[A-Za-z]+"; // TL with >1 characters

    const emailPattern = new RegExp(
      `^${localLabel}@${domainPart}${tld}$`
    );

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

  public static unicode(): ExtendedValidatorFn<"unicode">{
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

  public static orgIdentifier(): ExtendedValidatorFn<"orgIdentifier">{
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

  public static orgName(): ExtendedValidatorFn<"orgName">{
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



