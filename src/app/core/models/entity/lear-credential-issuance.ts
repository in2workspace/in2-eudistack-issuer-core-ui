
import { ValidatorEntry } from "src/app/shared/validators/credential-issuance/all-validators";

export const ISSUANCE_CREDENTIAL_TYPES_ARRAY = ['LEARCredentialEmployee', 'LEARCredentialMachine'] as const;
export type IssuanceCredentialType = typeof ISSUANCE_CREDENTIAL_TYPES_ARRAY[number];

// todo consider renaming
// todo enhance typing
// todo add error/s message field to decouple validation from displayed message responsibilities
// todo remove display: make a prop/array in CredentialIssuanceFormSchema for each type
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
    staticValueGetter?: () => any; //in case it is side (or pref_side + asSigner)
};

export interface CredentialIssuanceSchemaBuilder {
  readonly credType: IssuanceCredentialType;
  getSchema(): CredentialIssuanceSchemaTuple;
}

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