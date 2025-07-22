import { ValidatorEntryUnion } from "src/app/shared/validators/credential-issuance/all-validators";
import { TmfAction, TmfFunction } from "./lear-credential";
import { ComponentType, Portal } from "@angular/cdk/portal";
import { HasFormInput } from "src/app/features/credential-details/components/has-form-input";
import { FormControl, FormGroup } from "@angular/forms";
export const ISSUANCE_CREDENTIAL_TYPES_ARRAY = ['LEARCredentialEmployee', 'LEARCredentialMachine'] as const;
export type IssuanceCredentialType = typeof ISSUANCE_CREDENTIAL_TYPES_ARRAY[number];

// todo consider renaming
// todo enhance typing
// todo add error/s message field to decouple validation from displayed message responsibilities
// todo remove display: make a prop/array in CredentialIssuanceFormSchema for each type
// todo add custom field to allow using a custom component (similar to details)
export type CredentialIssuanceFormFieldSchema = {
    key: string, //this is used for models fields names and also as label for transations; i.e. "credentialIssuance.mandatee"
    type: 'control' | 'group';
    display?: 'main' | 'side' | 'pref_side'; // should it be displayed in the main space or as a side card? 'pref_side' for sections that are only displayed in main in "asSigner" mode
    controlType?: 'text' | 'number' | 'selector', // for type 'control' only
    multiOptions?: SelectorOption[], //only for 'selector' (and similars if added: 'radio' and 'checkbox')
    groupFields?: CredentialIssuanceFormSchema; //for 'group' only
    validators?: ValidatorEntryUnion[];
    hint?: string; //hint that is shown above the input
    classes?: string; //admits a string of separated clases; i.e.: "classOne classTwo"
    staticValueGetter?: () => IssuanceStaticDataSchema | null; //in case it is side (or pref_side + asSigner)
    custom?: {
      component: ComponentType<HasFormInput<any>>,
      data?: any 
    }
}

export interface CredentialIssuanceSchemaBuilder {
  readonly credType: IssuanceCredentialType;
  getSchema(): CredentialIssuanceFormSchema;
}

export type SelectorOption  = { label: string, value: string};


export type CredentialIssuanceFormSchema = CredentialIssuanceFormFieldSchema[];
export interface IssuanceFormPowerSchema{
  //todo: in the future, if there are multiple domains, add a "domain" field (currently there is only "DOME")
  function: string,
  action: string[],
  isIn2Required: boolean
}

export type IssuanceStaticDataSchema = {
    mandator?: {key:string, value:string}[];
}

export type CredentialIssuanceGlobalFormState = {
    form: Record<string, any>;
}

export type IssuanceRawPowerForm = Partial<Record<TmfFunction, Record<TmfAction, boolean>>>;

export interface KeyState {
  desmosPrivateKeyValue: string,
  desmosDidKeyValue: string
}

export interface KeyForm{
  didKey: FormControl<string>,
}

// data collected in Issuance component after submitting form
export interface IssuanceRawCredentialPayload {
        partialCredentialSubject: Record<string, any>, 
        optional: { staticData: IssuanceStaticDataSchema | null },
        asSigner: boolean
}