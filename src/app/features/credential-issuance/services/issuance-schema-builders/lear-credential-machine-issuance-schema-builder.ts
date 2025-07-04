import { inject, Injectable } from "@angular/core";
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema, CredentialIssuanceSchemaBuilder, CredentialIssuanceSchemaTuple, IssuanceCredentialType } from "src/app/core/models/entity/lear-credential-issuance";
import { AuthService } from "src/app/core/services/auth.service";
import { CountryService } from "src/app/core/services/country.service";
import { nameValidatorEntries, serialNumberValidatorEntries, orgNameValidatorEntries, orgIdValidatorEntries } from "src/app/shared/validators/credential-issuance/validators-entries";
import { convertToOrderedArray, mandatorFieldsOrder } from "../../helpers/fields-order-helpers";

@Injectable({ providedIn: 'root' })
export class LearCredentialMachineIssuanceSchemaBuilder implements CredentialIssuanceSchemaBuilder {
  public readonly credType: IssuanceCredentialType = 'LEARCredentialMachine';

  private readonly authService = inject(AuthService);
  private readonly countryService = inject(CountryService);

  public getSchema(): CredentialIssuanceSchemaTuple {
    const countriesSelectorOptions = this.countryService.getCountriesAsSelectorOptions();

    const form: CredentialIssuanceFormSchema = [
      // MANDATEE
      {
        key: 'mandatee',
        type: 'group',
        display: 'main',
        groupFields: [
          {
            key: 'domain',
            type: 'control',
            controlType: 'text',
            validators: [
              { name: 'required' },
              { name: 'isDomain' }
            ]
          },
          {
            key: 'ipAddress',
            type: 'control',
            controlType: 'text',
            validators: [
              { name: 'isIP' }
            ]
          }
        ]
      },
      // MANDATOR (static when asSigner)
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
            key: 'serialNumber',
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
            validators: [
              ...orgNameValidatorEntries
            ]
          },
          {
            key: 'organizationIdentifier',
            type: 'control',
            controlType: 'text',
            validators: [ ...orgIdValidatorEntries ],
            hint: 'organizationIdentifier',
          },
          {
            key: 'country',
            type: 'control',
            controlType: 'selector',
            multiOptions: countriesSelectorOptions,
            validators: [{ name: 'required' }]
          }
        ]
      }
    ];

    const power: CredentialIssuancePowerFormSchema = {
      power: [
        {
          action: ['Execute'],
          function: 'Onboarding',
          isIn2Required: true
        }
      ]
    };

    return [form, power];
  }
}
