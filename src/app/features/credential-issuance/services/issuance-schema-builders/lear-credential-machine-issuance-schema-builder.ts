import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable } from "@angular/core";
import { CredentialIssuanceFormSchema, CredentialIssuanceSchemaBuilder, IssuanceCredentialType } from "src/app/core/models/entity/lear-credential-issuance";
import { AuthService } from "src/app/core/services/auth.service";
import { CountryService } from "src/app/core/services/country.service";
import { convertToOrderedArray, mandatorFieldsOrder } from "../../helpers/fields-order-helpers";
import { firstNameField, lastNameField, organizationField, organizationIdentifierField, serialNumberField } from "./common-fields";
import { KeyGeneratorComponent } from "../../components/key-generator/key-generator.component";
import { FormControl, FormGroup } from '@angular/forms';
import { IssuancePowerComponent } from '../../components/power/issuance-power.component';

@Injectable({ providedIn: 'root' })
export class LearCredentialMachineIssuanceSchemaBuilder implements CredentialIssuanceSchemaBuilder {
  public readonly credType: IssuanceCredentialType = 'LEARCredentialMachine';

  private readonly authService = inject(AuthService);
  private readonly countryService = inject(CountryService);

  public getSchema(): CredentialIssuanceFormSchema {
    const countriesSelectorOptions = this.countryService.getCountriesAsSelectorOptions();

    const form: CredentialIssuanceFormSchema = [
      // KEYS
      {
        key: 'keys',
        type: 'group',
        display: 'main',
        custom: {
          component: KeyGeneratorComponent
        },
        groupFields: [
          {
            key: 'didKey',
            type: 'control',
            validators: [{name: 'required'}]
          }
        ]
      },
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
            ...firstNameField
          },
          {
            ...lastNameField
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
      // POWER
      {
        key: 'power',
        type: 'group',
        groupFields: [],
        custom: {
          component: IssuancePowerComponent,
          data: [
                {
                  action: ['Execute'],
                  function: 'Onboarding',
                  isIn2Required: false //todo segur?
                }
          ]
        }
      },
    ];

    return form;
  }
}
