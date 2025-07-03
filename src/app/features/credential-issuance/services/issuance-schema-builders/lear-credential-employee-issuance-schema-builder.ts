import { inject, Injectable } from "@angular/core";
import { AuthService } from "src/app/core/services/auth.service";
import { CountryService } from "src/app/core/services/country.service";
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema, CredentialIssuanceSchemaBuilder, CredentialIssuanceSchemaTuple, IssuanceCredentialType } from "src/app/core/models/entity/lear-credential-issuance";
import { nameValidatorEntries, emailValidatorEntries, serialNumberValidatorEntries, orgNameValidatorEntries, orgIdValidatorEntries } from "src/app/shared/validators/credential-issuance/validators-entries";

@Injectable({ providedIn: 'root' })
export class LearCredentialEmployeeSchemaBuilder implements CredentialIssuanceSchemaBuilder {
  public readonly credType: IssuanceCredentialType = 'LEARCredentialEmployee';

  private readonly authService = inject(AuthService);
  private readonly countriesService = inject(CountryService);


  public getSchema(): CredentialIssuanceSchemaTuple {
    
    const countriesSelectorOptions = this.countriesService.getCountriesAsSelectorOptions();
    
    const form: CredentialIssuanceFormSchema = [
        // MANDATEE
        {
          key: 'mandatee',
          classes: 'mandatee',
          type: 'group',
          display: 'main',
          groupFields: [
            { key:'firstName', type: 'control', controlType: 'text', validators: [...nameValidatorEntries] },
            { key:'lastName', type: 'control', controlType: 'text', validators:[...nameValidatorEntries] },
            { key:'email', type: 'control', controlType: 'text', validators: [...emailValidatorEntries] },
            {
              key:'nationality', 
              type: 'control',
              controlType: 'selector',
              multiOptions: countriesSelectorOptions,
              validators: [{ name: 'required' }]
            },
          ],
        },
        // MANDATOR
        {
          key: 'mandator',
          type: 'group',
          display: 'pref_side',
          staticValueGetter: () => {
            const mandator = this.authService.getRawMandator();
            return mandator ? { mandator } : null;
          },
          groupFields: [
            {
              key: 'firstName',
              type: 'control',
              controlType: 'text',
              validators: [
                ...nameValidatorEntries
              ]
            },
            {
              key: 'lastName',
              type: 'control',
              controlType: 'text',
              validators: [
                ...nameValidatorEntries
              ]
            },
            { 
              key:'emailAddress', 
              type: 'control', 
              controlType: 'text', 
              validators: [
                ...emailValidatorEntries
              ] 
            },
            {
              key: 'serialNumber',
              hint: 'serialNumber',
              type: 'control',
              controlType: 'text',
              validators: [
                ...serialNumberValidatorEntries
              ]
            },
            {
              key: 'organization',
              type: 'control',
              controlType: 'text',
              validators: [ ...orgNameValidatorEntries ]
            },
            {
              key: 'organizationIdentifier',
              type: 'control',
              controlType: 'text',
              validators: [ ...orgIdValidatorEntries ]
            },
            {
              key: 'country',
              type: 'control',
              controlType: 'selector',
              multiOptions: countriesSelectorOptions,
              validators: [{ name: 'required' }]
            }
          ]
        }];
    const power: CredentialIssuancePowerFormSchema = { 
          power: [
            {
                "action": ["Execute"],
                "function": "Onboarding",
                isIn2Required: true
            },
            {
                "action": [
                    "Create",
                    "Update",
                    "Delete",
                ],
                "function": "ProductOffering",
                isIn2Required: false
            },
            {
                "action": [
                    "Upload",
                    "Attest"
                ],
                "function": "Certification",
                isIn2Required: true
            }
      ]};
    return [form, power];
  }

}
