// --- Form Schemas ---

import { ValidatorEntry } from "src/app/shared/validators/credential-issuance/issuance-validators";


//todo packs de validators com "name", "serial number", "email"

//todo canviar a -issuance-form-schema
// todo unir params de control en controlConfig i de group en groupConfig
export type CredentialIssuanceFormFieldSchema = {
    key: string,
    type: 'control' | 'group';
    display?: 'main' | 'side' | 'pref_side'; //should it be displayed in the main space or as a side card? 'pref_side' for sections that are only displayed in main in "asSigner" mode
    // todo afegir-hi per a selector! (p. ex. country)
    controlType?: 'text' | 'number' | 'selector', // for 'control' only
    multiOptions?: SelectorOption[], //only for 'selector', 'radio' and 'checkbox'
    groupFields?: CredentialIssuanceFormSchema; //for 'group' only
    errors?: string[], // todo remove?
    validators?: ValidatorEntry[];
    classes?: string //admits a string of separated clases; i.e.: "classOne classTwo"
    // todo altres paràmetres? placeholder, class
};

export type SelectorOption  = { label: string, value: string};

//todo fer que CredentialIssuanceFormFieldSchema sigui union type de control i group?

export type CredentialIssuanceFormSchema = CredentialIssuanceFormFieldSchema[];
export interface IssuanceFormPowerSchema{
  //todo: add domain, use it in form (currently there is only "DOME")
  function: string,
  action: string[],
  isIn2Required: boolean
}
export type CredentialIssuancePowerFormSchema = { power: IssuanceFormPowerSchema[]}
  

export function getLearCredentialEmployeeIssuanceFormSchemas(countries: SelectorOption[]): [CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema] {
    return [
      [
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
            //todo multiOptions
            {
              key:'nationality', 
              type: 'control',
              controlType: 'selector',
              multiOptions: countries,
              validators: [{ name: 'required' }]
            },
          ],
        },
        // MANDATOR
        {
          key: 'mandator',
          type: 'group',
          display: 'pref_side',
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
              key:'email', 
              type: 'control', 
              controlType: 'text', 
              validators: [{name:'required'}, {name:'customEmail'}] 
            },
            {
              key: 'serialNumber',
              type: 'control',
              controlType: 'text',
              validators: [{name:'minLength', args:[7]}, {name:'maxLength', args:[15]}, {name:'pattern', args:["^[a-zA-Z0-9-]+$"]}]
            },
            {
              key: 'organization',
              type: 'control',
              controlType: 'text',
              validators: [{ name: 'required' }, {name:'minLength', args:[2]}, {name:'maxLength', args:[15]}, {name:'orgName'}]
            },
            {
              key: 'organizationIdentifier',
              type: 'control',
              controlType: 'text',
              validators: [{ name: 'required' }, {name:'minLength', args:[7]}, {name:'maxLength', args:[15]}, {name:'orgId'}]
            },
            {
              key: 'country',
              type: 'control',
              controlType: 'selector',
              multiOptions: countries,
              validators: [{ name: 'required' }]
            }
          ]
        }],
        // POWER
        { 
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
      ]}]
}
  
// todo fer directori per cada schema
export function getLearCredentialMachineIssuanceFormSchemas(
  countries: SelectorOption[]
): [CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema] {
  return [
    [
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
              { name: 'required' },
              { name: 'isIP' }
            ]
          }
        ]
      },
      // MANDATOR
      {
        key: 'mandator',
        type: 'group',
        display: 'pref_side',
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
              key:'email', 
              type: 'control', 
              controlType: 'text', 
              validators: [{name:'required'}, {name:'customEmail'}] 
            },
            {
              key: 'serialNumber',
              type: 'control',
              controlType: 'text',
              validators: [{name:'minLength', args:[7]}, {name:'maxLength', args:[15]}, {name:'pattern', args:["^[a-zA-Z0-9-]+$"]}]
            },
            {
              key: 'organization',
              type: 'control',
              controlType: 'text',
              validators: [{ name: 'required' }, {name:'minLength', args:[2]}, {name:'maxLength', args:[15]}, {name:'orgName'}]
            },
            {
              key: 'organizationIdentifier',
              type: 'control',
              controlType: 'text',
              validators: [{ name: 'required' }, {name:'minLength', args:[7]}, {name:'maxLength', args:[15]}, {name:'orgId'}]
            },
            {
              key: 'country',
              type: 'control',
              controlType: 'selector',
              multiOptions: countries,
              validators: [{ name: 'required' }]
            }
          ]
      }
    ],
    {
      power: [
        {
          action: ['Execute'],
          function: 'Onboarding',
          isIn2Required: true
        },
        //todo remove
        {
          action: ['Create', 'Update', 'Delete'],
          function: 'ProductOffering',
          isIn2Required: false
        },
        {
          action: ['Upload', 'Attest'],
          function: 'Certification',
          isIn2Required: false
        }
      ]
    }
  ];
}


export const commonMandatorIssuanceFields = {
        firstName: { type: 'control', validators: [] },
        lastName: { type: 'control' },
        email: { type: 'control' },
        nationality: { type: 'control' },
      };
    
    