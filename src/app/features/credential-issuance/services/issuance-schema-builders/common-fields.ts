import { CredentialIssuanceFormFieldSchema } from "src/app/core/models/entity/lear-credential-issuance";
import { nameValidatorEntries, orgIdValidatorEntries, orgNameValidatorEntries, serialNumberValidatorEntries } from "src/app/shared/validators/credential-issuance/validators-entries";

export const firstNameField: CredentialIssuanceFormFieldSchema = { key: 'firstName', type: 'control', controlType: 'text', validators: [...nameValidatorEntries] };
export const lastNameField: CredentialIssuanceFormFieldSchema = { key: 'lastName', type: 'control', controlType: 'text', validators: [...nameValidatorEntries] };
export const serialNumberField: CredentialIssuanceFormFieldSchema = {
            key: 'serialNumber',
            type: 'control',
            controlType: 'text',
            validators: [
              ...serialNumberValidatorEntries
            ]
          };
export const organizationField: CredentialIssuanceFormFieldSchema = {
            key: 'organization',
            type: 'control',
            controlType: 'text',
            validators: [
              ...orgNameValidatorEntries
            ]
          }
export const organizationIdentifierField: CredentialIssuanceFormFieldSchema = {
              key: 'organizationIdentifier',
              type: 'control',
              controlType: 'text',
              validators: [ ...orgIdValidatorEntries ],
              hint: 'organizationIdentifier',
            }
