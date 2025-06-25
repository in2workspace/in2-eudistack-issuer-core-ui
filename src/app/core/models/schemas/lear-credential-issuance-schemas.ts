// --- Form Schemas ---

import { ValidatorEntry } from "src/app/shared/validators/credential-issuance/all-validators";

// todo consider renaming
// todo enhance typing
// todo add staticGetter
// todo add error/s message field to decouple validation from displayed message responsibilities

export type CredentialIssuanceFormFieldSchema = {
    key: string, //this is used for models fields names and also as label for transations; i.e. "credentialIssuance.mandatee"
    type: 'control' | 'group';
    display?: 'main' | 'side' | 'pref_side'; // should it be displayed in the main space or as a side card? 'pref_side' for sections that are only displayed in main in "asSigner" mode
    controlType?: 'text' | 'number' | 'selector', // for type 'control' only
    multiOptions?: SelectorOption[], //only for 'selector' (and similars if added: 'radio' and 'checkbox')
    groupFields?: CredentialIssuanceFormSchema; //for 'group' only
    validators?: ValidatorEntry[];
    hint?: string; //hint that is shown above the input
    classes?: string; //admits a string of separated clases; i.e.: "classOne classTwo"
};

export type SelectorOption  = { label: string, value: string};


export type CredentialIssuanceFormSchema = CredentialIssuanceFormFieldSchema[];
export interface IssuanceFormPowerSchema{
  //todo: in the future, if there are multiple domains, add a "domain" field (currently there is only "DOME")
  function: string,
  action: string[],
  isIn2Required: boolean
}
export type CredentialIssuancePowerFormSchema = { power: IssuanceFormPowerSchema[]}

export type CredentialIssuanceSchemaTuple = [CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema];

export function getLearCredentialEmployeeIssuanceFormSchemas(countries: SelectorOption[]): CredentialIssuanceSchemaTuple {
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
  
export function getLearCredentialMachineIssuanceFormSchemas(
  countries: SelectorOption[]
): CredentialIssuanceSchemaTuple {
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
              { name: 'isIP' }
            ]
          }
        ]
      },
      // MANDATOR
      //todo add email?
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
        }
      ]
    }
  ];
}
    
    