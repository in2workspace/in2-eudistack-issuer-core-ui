import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";

export type CustomValidatorEntry = { name: CustomValidatorName; args?: any[] };

//todo add validators from directives
//todo use i18n strings as error messages
export class CustomValidators {

  public static isDomain(): ValidatorFn {
    const domainRegex =
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (typeof value !== 'string') return { isDomain: 'Value must be a string' };
      return domainRegex.test(value) ? null : { isDomain: 'Invalid domain format' };
    };
  }

  public static isIP(): ValidatorFn {
    const ipv4 =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    const ipv6 =
      /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|::1)$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (typeof value !== 'string') return { isIP: 'Value must be a string' };
      return ipv4.test(value) || ipv6.test(value) ? null : { isIP: 'error.form.ip' };
    };
  }

  public static customEmail(): ValidatorFn {
    const emailPattern = 
  /^[a-zA-Z0-9](?:[a-zA-Z0-9+_-]|(?:\.[a-zA-Z0-9+_-]))*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]+$/;


    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
    
      if (!email || typeof email !== 'string') {
        return null;
      }
    
      if (!emailPattern.test(email)) {
        return { customEmail: 'Invalid pattern' };
      }
    
      const [localPart, domain] = email.split('@');

      if (localPart.length > 64) {
        return { customEmail: 'Local part is too long' };
      }

      if (domain.length > 255) {
        return { customEmail: 'Domain part is too long' };
      }
    
      const domainParts = domain.split('.');
    
      const mainDomain = domainParts.slice(0, -1).join('.');
      if (mainDomain.length < 2) {
        return { customEmail: 'Domain too short' };
      }
    
      const topLevelDomain = domainParts[domainParts.length - 1];
      if (topLevelDomain.length < 2) {
        return { customEmail: 'domain too short' };
      }
    
      return null; 
    }
  }

  public static unicode(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^[A-Za-zÀ-ÿ'’ -]+$/;
      const value = control.value;

      if (!value) {
        return null;
      }

      const isValid = pattern.test(value);
      return isValid ? null : { invalidUnicode: 'Invalid unicode' };
    }
  }

  public static orgIdentifier(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
        const pattern = /^[a-zA-Z0-9]+$/;
        const value = control.value;

        if (!value) {
          return null;
        }

        if (value.toLowerCase().startsWith('vat')) {
          return { invalidOrgId: 'Do not start with VAT!' };
        }
        

        const isValid = pattern.test(value);
        return isValid ? null : { invalidOrgId: 'Invalid org id' };
      }
  }

  public static orgName(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
    const pattern = /^[\p{Script=Latin}\p{M}0-9'&\-,.()/ ]+$/u;
    const value = control.value;

    if (!value) {
      return null;
    }

    const isValid = pattern.test(value);
    return isValid ? null : { invalidOrgName: 'Inalid name' };
  }
  }

  //todo cal?
  public static maxLength(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    return value.length > maxLength
      ? { maxlengthExceeded: 'Max ' + maxLength }
      : null;
  };
}

}

export const CUSTOM_VALIDATORS_FACTORY_MAP: Record<
  string,
  (...args: any[]) => ValidatorFn
> = {
  isDomain: CustomValidators.isDomain,
  isIP: CustomValidators.isIP,
  customEmail: CustomValidators.customEmail,
  unicode: CustomValidators.unicode,
  orgIdentifier: CustomValidators.orgIdentifier,
  orgName: CustomValidators.orgName,
  maxLength: CustomValidators.maxLength
} as const;

export type CustomValidatorName = keyof typeof CUSTOM_VALIDATORS_FACTORY_MAP;



