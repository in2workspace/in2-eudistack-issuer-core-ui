import { inject, Injectable } from "@angular/core";
import { AuthService } from "src/app/core/services/auth.service";
import { CountryService } from "src/app/core/services/country.service";
import { CredentialIssuanceFormSchema, CredentialIssuanceSchemaBuilder, IssuanceCredentialType } from "src/app/core/models/entity/lear-credential-issuance";
import { emailValidatorEntries } from "src/app/shared/validators/credential-issuance/validators-entries";
import { convertToOrderedArray, mandatorFieldsOrder } from "../../helpers/fields-order-helpers";
import { firstNameField, lastNameField, organizationField, organizationIdentifierField, serialNumberField } from "./common-fields";
import { IssuancePowerComponent } from "../../components/power/issuance-power.component";

@Injectable({ providedIn: 'root' })
export class LearCredentialEmployeeSchemaBuilder implements CredentialIssuanceSchemaBuilder {
  public readonly credType: IssuanceCredentialType = 'LEARCredentialEmployee';

  private readonly authService = inject(AuthService);
  private readonly countriesService = inject(CountryService);


  public getSchema(): CredentialIssuanceFormSchema {
    
    const countriesSelectorOptions = this.countriesService.getCountriesAsSelectorOptions();
    
    const form: CredentialIssuanceFormSchema = [

        // MANDATEE
        {
          key: 'mandatee',
          classes: 'mandatee',
          type: 'group',
          display: 'main',
          groupFields: [
            { ...firstNameField },
            { ...lastNameField },
            { key: 'email', type: 'control', controlType: 'text', validators: [...emailValidatorEntries] },
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
            return mandator ? { mandator: convertToOrderedArray(mandator, mandatorFieldsOrder) } : null;
          },
          groupFields: [
            {
              ...firstNameField
            },
            {
              ...lastNameField
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
              ...serialNumberField
            },
            {
              ...organizationField
            },
            {
              ...organizationIdentifierField
            },
            {
              key: 'country',
              type: 'control',
              controlType: 'selector',
              multiOptions: countriesSelectorOptions,
              validators: [{ name: 'required' }]
            }
          ]
        },
      //  POWER
      {
        key: 'power',
        type: 'group',
        groupFields: [],
        custom: {
          component: IssuancePowerComponent,
          data: [
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
      ]
        }
      },];
    return form;
  }

}
