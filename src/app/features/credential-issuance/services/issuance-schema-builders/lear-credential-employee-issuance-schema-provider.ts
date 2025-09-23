import { inject, Injectable } from "@angular/core";
import { AuthService } from "src/app/core/services/auth.service";
import { CountryService } from "src/app/shared/services/country.service";
import { CredentialIssuanceTypedViewModelSchema, CredentialIssuanceSchemaProvider } from "src/app/core/models/entity/lear-credential-issuance";
import { convertToOrderedArray, employeeMandatorFieldsOrder } from "../../helpers/fields-order-helpers";
import { emailField, firstNameField, lastNameField, organizationField, organizationIdentifierField, serialNumberField } from "./common-issuance-schema-fields";
import { IssuancePowerComponent } from "../../components/power/issuance-power.component";
import { baseNameLengthValidatorEntries, nameValidatorEntries } from "src/app/shared/validators/credential-issuance/validators-entries";

@Injectable({ providedIn: 'root' })
export class LearCredentialEmployeeSchemaProvider implements CredentialIssuanceSchemaProvider<'LEARCredentialEmployee'> {

  private readonly authService = inject(AuthService);
  private readonly countriesService = inject(CountryService);


  public getSchema(): CredentialIssuanceTypedViewModelSchema<'LEARCredentialEmployee'> {
    
    const countriesSelectorOptions = this.countriesService.getCountriesAsSelectorOptions();
    
    return {
      type: 'LEARCredentialEmployee',
      schema: [

        // MANDATEE
        {
          key: 'mandatee',
          classes: 'mandatee',
          type: 'group',
          display: 'main',
          groupFields: [
            { ...firstNameField },
            { ...lastNameField },
            { ...emailField },
            { key: 'employeeId', type: 'control', controlType: 'text', validators: [...baseNameLengthValidatorEntries] }
          ],
        },
        // MANDATOR
        {
          key: 'mandator',
          type: 'group',
          display: 'pref_side',
          staticValueGetter: () => {
            const mandator = this.authService.getRawMandator();
            return mandator ? { mandator: convertToOrderedArray(mandator, employeeMandatorFieldsOrder) } : null;
          },
          groupFields: [
            {
              ...firstNameField
            },
            {
              ...lastNameField
            },
            { ...emailField 
              
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
      }]};
  }

}
