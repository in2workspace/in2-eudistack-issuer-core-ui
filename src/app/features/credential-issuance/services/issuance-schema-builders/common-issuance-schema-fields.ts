import { CredentialIssuanceViewModelField } from "src/app/core/models/entity/lear-credential-issuance";
import { emailValidatorEntries, nameValidatorEntries, orgIdValidatorEntries, orgNameValidatorEntries, serialNumberValidatorEntries } from "src/app/shared/validators/credential-issuance/validators-entries";

export const firstNameField: CredentialIssuanceViewModelField = { key: 'firstName', type: 'control', controlType: 'text', validators: [...nameValidatorEntries] };
export const lastNameField: CredentialIssuanceViewModelField = { key: 'lastName', type: 'control', controlType: 'text', validators: [...nameValidatorEntries] };
export const emailField: CredentialIssuanceViewModelField =  { key: 'email', type: 'control', controlType: 'text', validators: [...emailValidatorEntries] };
export const serialNumberField: CredentialIssuanceViewModelField = {
            key: 'serialNumber',
            type: 'control',
            controlType: 'text',
            validators: [
              ...serialNumberValidatorEntries
            ]
          };
export const organizationField: CredentialIssuanceViewModelField = {
            key: 'organization',
            type: 'control',
            controlType: 'text',
            validators: [
              ...orgNameValidatorEntries
            ]
          }
export const organizationIdentifierField: CredentialIssuanceViewModelField = {
              key: 'organizationIdentifier',
              type: 'control',
              controlType: 'text',
              validators: [ ...orgIdValidatorEntries ],
              hint: 'organizationIdentifier',
            }
