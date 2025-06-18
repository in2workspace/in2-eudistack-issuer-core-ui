// --- Form Schemas ---

import { ValidatorEntry } from "src/app/shared/validators/credential-issuance/issuance-validators";

//todo canviar a -issuance-form-schema
// todo unir params de control en controlConfig i de group en groupConfig
export type CredentialIssuanceFormFieldSchema = {
    type: 'control' | 'group';
    display?: 'main' | 'side' | 'pref_side'; //should it be displayed in the main space or as a side card? 'pref_side' for sections that are only displayed in main in "asSigner" mode
    // todo afegir-hi per a selector! (p. ex. country)
    controlType?: 'text' | 'number' | 'selector', // for 'control' only
    multiOptions?: SelectorOption[], //only for 'selector', 'radio' and 'checkbox'
    groupFields?: CredentialIssuanceFormSchema; //for 'group' only
    errors?: string[], // todo remove?
    validators?: ValidatorEntry[];
    class?: string
    // todo altres paràmetres? placeholder, class
};

export type SelectorOption  = { label: string, value: string};

//todo fer que CredentialIssuanceFormFieldSchema sigui union type de control i group
// export type CredentialIssuanceFormControlSchema = {
//   type: 'control',
//   controlType: 'string' | 'number',
//   errors?: string[],
//   validators?: ValidatorEntry[]
// }

// export type CredentialIssuanceFormGroupSchema = {
//   type: 'group';
//   display?: 'main' | 'side' | 'pref_side';
//   groupFields?: CredentialIssuanceFormSchema;
// }

export type CredentialIssuanceFormSchema = Record<string, CredentialIssuanceFormFieldSchema>;
export interface IssuanceFormPowerSchema{
  //todo: add domain, use it in form (currently there is only "DOME")
  function: string,
  action: string[],
  isIn2Required: boolean
}
export type CredentialIssuancePowerFormSchema = { power: IssuanceFormPowerSchema[]}
  

// export const LearCredentialEmployeeIssuanceFormSchema: CredentialIssuanceFormSchema = {
//     mandatee: {
//       type: 'group',
//       display: 'main',
//       groupFields: {
//         firstName: { type: 'control', validators: [] },
//         lastName: { type: 'control' },
//         email: { type: 'control' },
//         nationality: { type: 'control' },
//       },
//     },
//     mandator: {
//       type: 'group',
//       display: 'side',
//       groupFields: commonMandatorFields,
//     },
//     issuer: {
//       type: 'group',
//       display: 'side',
//       groupFields: commonIssuerFields,
//     },
//     power: [
  //     {
  //         "action": ["Execute"],
  //         "function": "Onboarding",
  //         isIn2Required: true
  //     },
  //     {
  //         "action": [
  //             "Create",
  //             "Update",
  //             "Delete",
  //         ],
  //         "function": "ProductOffering",
  //         isIn2Required: false
  //     },
  //     {
  //         "action": [
  //             "Upload",
  //             "Attest"
  //         ],
  //         "function": "Certification",
  //         isIn2Required: false
  //     }
  // ]
//   };
  
// todo fer directori per cada schema
export function getLearCredentialMachineIssuanceFormSchemas(countries: SelectorOption[]): [CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema] {
  return [{
    mandatee: {
      type: 'group',
      display: 'main',
      groupFields: {
        domain: {
          type: 'control',
          controlType: 'text',
          validators: [{ name: 'required' }, { name: 'isDomain' }]
        },
        ipAddress: {
          type: 'control',
          controlType: 'text',
          validators: [{ name: 'required' }, { name: 'isIP' }]
        }
      }
    },
    mandator: {
      type: 'group',
      display: 'pref_side',
      groupFields: {
        organizationIdentifier: {
          type: 'control',
          controlType: 'text',
          validators: [{ name: 'required' }]
        },
        organization: {
          type: 'control',
          controlType: 'text',
          validators: [{ name: 'required' }]
        },
        country: {
          type: 'control',
          controlType: 'selector',
          multiOptions: countries,
          validators: [{ name: 'required' }]
        },
        firstName: {
          type: 'control',
          controlType: 'text',
          validators: [{ name: 'required' }]
        },
        lastName: {
          type: 'control',
          controlType: 'text',
          validators: [{ name: 'required' }]
        },
        serialNumber: {
          type: 'control',
          controlType: 'text',
          validators: [{ name: 'required' }]
        }
      }
    },
  }, 
  { 
    power: [
      {
          "action": ["Execute"],
          "function": "Onboarding",
          isIn2Required: true
      },
      //todo remove after tests
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
          isIn2Required: false
      }
  ]
  }];
}
    
    // todo later!
    // power: {
    //   type: 'group',
    //   display: 'main',
      //content will be set dynamically
    // },


  
  // export const VerifiableCertificationIssuanceFormSchema: CredentialIssuanceFormSchema = {
  //   attester: {
  //     type: 'group',
  //     display: 'side',
  //     groupFields: {
  //       id: { type: 'control' },
  //       firstName: { type: 'control' },
  //       lastName: { type: 'control' },
  //       organization: { type: 'control' },
  //       organizationIdentifier: { type: 'control' },
  //       country: { type: 'control' },
  //     }
  //   },
  //   issuer: {
  //     type: 'group',
  //     display: 'side',
  //     groupFields: {
  //       commonName: { type: 'control' },
  //       organization: { type: 'control' },
  //       country: { type: 'control' },
  //     },
  //   },
  //   company: {
  //     type: 'group',
  //     display: 'main',
  //     groupFields: {
  //       id: { type: 'control' },
  //       commonName: { type: 'control' },
  //       organization: { type: 'control' },
  //       country: { type: 'control' },
  //       email: { type: 'control' },
  //       address: { type: 'control' },
  //     },
  //   },
  //   product: {
  //     type: 'group',
  //     display: 'main',
  //     groupFields: {
  //       productId: { type: 'control' },
  //       productName: { type: 'control' },
  //       productVersion: { type: 'control' },
  //     },
  //   },
  //   compliance: {
  //     type: 'group',
  //     display: 'main',
  //     groupFields: {} //content will be set dynamically
  //   },
  // };
