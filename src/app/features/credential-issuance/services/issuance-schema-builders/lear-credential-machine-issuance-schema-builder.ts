import { inject, Injectable } from "@angular/core";
import { IssuanceCredentialType } from "src/app/core/models/entity/lear-credential";
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema, CredentialIssuanceSchemaBuilder, CredentialIssuanceSchemaTuple } from "src/app/core/models/entity/lear-credential-issuance";


import { AuthService } from "src/app/core/services/auth.service";
import { CountryService } from "src/app/core/services/country.service";

@Injectable({ providedIn: 'root' })
export class LearCredentialMachineIssuanceSchemaBuilder implements CredentialIssuanceSchemaBuilder {
  readonly credType: IssuanceCredentialType = 'LEARCredentialMachine';

  private readonly authService = inject(AuthService);
  private readonly countryService = inject(CountryService);

  getSchema(): CredentialIssuanceSchemaTuple {
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
        value: () => {
          const mandator = this.authService.getMandator();
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
            validators: [
              { name: 'required' },
              { name: 'minLength', args: [2] },
              { name: 'maxLength', args: [50] },
              { name: 'unicode' }
            ]
          },
          {
            key: 'serialNumber',
            hint: 'serialNumber',
            type: 'control',
            controlType: 'text',
            validators: [
              { name: 'minLength', args: [7] },
              { name: 'maxLength', args: [15] },
              { name: 'pattern', args: ["^[a-zA-Z0-9-]+$"] }
            ]
          },
          {
            key: 'organization',
            type: 'control',
            controlType: 'text',
            validators: [
              { name: 'required' },
              { name: 'minLength', args: [2] },
              { name: 'maxLength', args: [50] },
              { name: 'orgName' }
            ]
          },
          {
            key: 'organizationIdentifier',
            type: 'control',
            controlType: 'text',
            validators: [
              { name: 'required' },
              { name: 'minLength', args: [7] },
              { name: 'maxLength', args: [15] },
              { name: 'orgIdentifier' }
            ]
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
