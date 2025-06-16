import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { CredentialType } from 'src/app/core/models/entity/lear-credential';
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema, getLearCredentialMachineIssuanceFormSchemas } from 'src/app/core/models/entity/lear-credential-issuance-schemas';
import { CountryService } from 'src/app/shared/components/form-credential/services/country.service';
import { ALL_VALIDATORS_FACTORY_MAP, ValidatorEntry } from 'src/app/shared/validators/credential-issuance/issuance-validators';


@Injectable({
  providedIn: 'root'
})
export class CredentialIssuanceTwoService {

  private readonly countryService = inject(CountryService);

  constructor() { }

  getValidatorFn(entry: ValidatorEntry): ValidatorFn | null {
    const factory = ALL_VALIDATORS_FACTORY_MAP[entry.name];
    return factory ? factory(...(entry.args ?? [])) : null;
}

  issuanceFormBuilder(schema: CredentialIssuanceFormSchema): FormGroup {
    const group: Record<string, any> = {};

    for (const [key, field] of Object.entries(schema)) {
      if(field.ignore === true){ continue }

      if (field.type === 'control') {
        const validators = field.validators?.map(this.getValidatorFn).filter(Boolean) as ValidatorFn[];
        group[key] = new FormControl('', validators);
      } else if (field.type === 'group' && field.groupFields) {
        group[key] = this.issuanceFormBuilder(field.groupFields);
      } else {
        console.warn(`Unknown or invalid field type for key "${key}"`);
      }
    }

    return new FormGroup(group);
  }

  getShemasFromCredentialType(credType: CredentialType):[CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema]{
    //todo
    if(credType === 'LEARCredentialEmployee'){
      const countries = this.countryService.getCountriesAsSelectorOptions();
      return getLearCredentialMachineIssuanceFormSchemas(countries);
    }else if(credType === 'LEARCredentialMachine'){
      const countries = this.countryService.getCountriesAsSelectorOptions();
      return getLearCredentialMachineIssuanceFormSchemas(countries);
      //todo
    }else if(credType === 'VerifiableCertification'){
      return [] as any;
    }else{
      throw new Error(`Unknown credential type: ${credType}`);
    }
  }

  getFormSchemaFromCredentialType(credType: CredentialType): CredentialIssuanceFormSchema{
    return this.getShemasFromCredentialType(credType)[0];
  }

  getPowersSchemaFromCredentialType(credType: CredentialType): CredentialIssuancePowerFormSchema{
    return this.getShemasFromCredentialType(credType)[1];
  }
}
