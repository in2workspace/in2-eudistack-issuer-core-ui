import { ValidatorEntryUnion } from "src/app/shared/validators/credential-issuance/all-validators";
import { TmfAction, TmfFunction } from "./lear-credential";
import { ComponentType } from "@angular/cdk/portal";
import { IssuanceCustomFormChild } from "src/app/features/credential-details/components/issuance-custom-form-child";
import { FormControl } from "@angular/forms";
export const ISSUANCE_CREDENTIAL_TYPES_ARRAY = ['LEARCredentialEmployee', 'LEARCredentialMachine'] as const;
export type IssuanceCredentialType = typeof ISSUANCE_CREDENTIAL_TYPES_ARRAY[number];

export interface BaseCredentialIssuanceViewModelField {
    key: string, //this is used for models fields names and also as label for transations; i.e. "credentialIssuance.mandatee"
    classes?: string; //admits a string of separated clases; i.e.: "classOne classTwo"
    staticValueGetter?: () => IssuanceStaticViewModel | null; // in case it is side (or pref_side + asSigner)
    custom?: { // the Issuance component has some default form templates (text/number input, selector), but custom components can be required (i.e. Powers)
      component: ComponentType<IssuanceCustomFormChild<any>>,
      data?: any 
    }
}


export interface CredentialIssuanceViewModelControlField extends BaseCredentialIssuanceViewModelField {
    type: 'control';
    controlType: 'text' | 'number' | 'selector',
    multiOptions?: SelectorOption[], //only for 'selector' (and similars if added: 'radio' and 'checkbox')
    validators: ValidatorEntryUnion[];
    hint?: string; //hint that is shown above the input
}

export interface CredentialIssuanceViewModelGroupField extends BaseCredentialIssuanceViewModelField {
    type: 'group';
    display?: 'main' | 'side' | 'pref_side'; // this specifies whether the group should be displayed in the main space or as a side card? 'pref_side' for sections that are only displayed in main in "asSigner" mode
    groupFields: CredentialIssuanceViewModelField[];
}

export type CredentialIssuanceViewModelField = CredentialIssuanceViewModelGroupField | CredentialIssuanceViewModelControlField;

export interface CredentialIssuanceSchemaProvider<T extends IssuanceCredentialType> {
  getSchema(): CredentialIssuanceTypedViewModelSchema<T>;
}

export type SelectorOption  = { label: string, value: string};

export type CredentialIssuanceViewModelSchema = CredentialIssuanceViewModelGroupField[];

export type CredentialIssuanceTypedViewModelSchema<T extends IssuanceCredentialType> = {
  type: T,
  schema: CredentialIssuanceViewModelSchema
};

export type IssuanceStaticViewModel = {
    mandator?: { key:string, value:string }[];
}

export type IssuanceViewModelsTuple = [CredentialIssuanceViewModelSchema, IssuanceStaticViewModel];

export type IssuanceRawPowerForm = Partial<Record<TmfFunction, Record<TmfAction, boolean>>>;

export interface IssuanceFormPowerSchema{
  //todo: in the future, if there are multiple domains, add a "domain" field (currently there is only "DOME")
  function: string,
  action: string[],
  isIn2Required: boolean
}
export interface KeyState {
  desmosPrivateKeyValue: string,
  desmosDidKeyValue: string
}

export interface KeyForm{
  didKey: FormControl<string>,
}

// data collected in Issuance component after submitting form
export interface IssuanceRawCredentialPayload {
        formData: Record<string, any>, 
        staticData: IssuanceStaticViewModel | null ,
        asSigner: boolean
}