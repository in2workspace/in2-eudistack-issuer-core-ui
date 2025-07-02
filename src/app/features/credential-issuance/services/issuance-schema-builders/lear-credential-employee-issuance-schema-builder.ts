import { inject, Injectable } from "@angular/core";
import { AuthService } from "src/app/core/services/auth.service";
import { CountryService } from "src/app/core/services/country.service";
import { IssuanceCredentialType } from "src/app/core/models/entity/lear-credential";
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema, CredentialIssuanceSchemaBuilder, CredentialIssuanceSchemaTuple } from "src/app/core/models/entity/lear-credential-issuance";

@Injectable({ providedIn: 'root' })
export class LearCredentialEmployeeSchemaBuilder implements CredentialIssuanceSchemaBuilder {
  readonly credType: IssuanceCredentialType = 'LEARCredentialEmployee';

  private readonly authService = inject(AuthService);
  private readonly countriesService = inject(CountryService);

  constructor( ) {}

  getSchema(): CredentialIssuanceSchemaTuple {
    
    const countriesSelectorOptions = this.countriesService.getCountriesAsSelectorOptions();
    
    const form: CredentialIssuanceFormSchema = [
        // MANDATEE
        {
          key: 'mandatee',
          classes: 'mandatee',
          type: 'group',
          display: 'main',
          groupFields: [
            { key:'firstName', type: 'control', controlType: 'text', validators: [{name:'required'}, {name:'minLength', args:[2]}, {name:'maxLength', args:[50]}, {name:'unicode'}] },
            { key:'lastName', type: 'control', controlType: 'text', validators:[{name:'required'}, {name:'minLength', args:[2]}, {name:'maxLength', args:[50]}, {name:'unicode'}] },
            { key:'email', type: 'control', controlType: 'text', validators: [{name:'required'}, {name:'customEmail'}] },
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
                { name: 'required' },
                { name: 'minLength', args: [2] },
                { name: 'maxLength', args: [50] },
                { name: 'unicode' }
              ]
            },
            {
              key: 'lastName',
              type: 'control',
              controlType: 'text',
              validators: [{name:'required'}, {name:'minLength', args:[2]}, {name:'maxLength', args:[50]}, {name:'unicode'}]
            },
            { 
              key:'emailAddress', 
              type: 'control', 
              controlType: 'text', 
              validators: [{name:'required'}, {name:'customEmail'}] 
            },
            {
              key: 'serialNumber',
              hint: 'serialNumber',
              type: 'control',
              controlType: 'text',
              validators: [{name:'minLength', args:[7]}, {name:'maxLength', args:[15]}, {name:'pattern', args:["^[a-zA-Z0-9-]+$"]}]
            },
            {
              key: 'organization',
              type: 'control',
              controlType: 'text',
              validators: [{ name: 'required' }, {name:'minLength', args:[2]}, {name:'maxLength', args:[50]}, {name:'orgName'}]
            },
            {
              key: 'organizationIdentifier',
              type: 'control',
              controlType: 'text',
              validators: [{ name: 'required' }, {name:'minLength', args:[7]}, {name:'maxLength', args:[15]}, {name:'orgIdentifier'}]
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
