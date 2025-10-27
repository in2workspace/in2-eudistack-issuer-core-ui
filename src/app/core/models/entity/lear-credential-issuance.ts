import { ValidatorEntryUnion } from "src/app/shared/validators/credential-issuance/all-validators";
import { TmfAction, TmfFunction } from "./lear-credential";
import { ComponentType } from "@angular/cdk/portal";
import { FormControl } from "@angular/forms";
import { BaseIssuanceCustomFormChild } from "src/app/features/credential-details/components/base-issuance-custom-form-child";
export const ISSUANCE_CREDENTIAL_TYPES_ARRAY = ['LEARCredentialEmployee', 'LEARCredentialMachine'] as const;
export type IssuanceCredentialType = typeof ISSUANCE_CREDENTIAL_TYPES_ARRAY[number];

export interface BaseCredentialIssuanceViewModelField {
    key: string, //this is used for form models fields names (FormGroup, FormControl) and also as label for transations; i.e. "mandatee" key is used in "credentialIssuance.mandatee"
    classes?: string; //admits a string of separated classes to customize form styles; i.e.: "classOne classTwo"
    staticValueGetter?: () => IssuanceStaticViewModel | null; // in case the value must be filled programatically (currently this happens when a field it is 'display: side' or 'pref_side' + asSigner)
    custom?: { // the Issuance component has some default form templates (text/number input, selector); this field allows for using custom components (i.e. Powers)
      component: ComponentType<BaseIssuanceCustomFormChild<any>>,
      data?: any 
    }
}

export interface CredentialIssuanceViewModelControlField extends BaseCredentialIssuanceViewModelField {
    type: 'control'; // for FormControl or custom components with one FormControl
    controlType: 'text' | 'number' | 'selector',
    multiOptions?: SelectorOption[], //only for 'selector' controlType (and similars if added in the future: 'radio' and 'checkbox')
    validators: ValidatorEntryUnion[];
    hint?: string; //hint that is shown above the control
}

export interface CredentialIssuanceViewModelGroupField extends BaseCredentialIssuanceViewModelField {
    type: 'group'; // for FormGroup or custom components which include multiple controls
    display?: 'main' | 'side' | 'pref_side'; // this specifies whether the group should be displayed in the main space or as a side card. 'pref_side' for sections that are only displayed in main when not "asSigner" mode
    groupFields: CredentialIssuanceViewModelField[];
}

// the id is needed to allow the "track function" in @for loops
export interface CredentialIssuanceViewModelGroupFieldWithId extends CredentialIssuanceViewModelGroupField{
  id: number;
}

export type CredentialIssuanceViewModelField = CredentialIssuanceViewModelGroupField | CredentialIssuanceViewModelControlField;

export interface CredentialIssuanceSchemaProvider<T extends IssuanceCredentialType> {
  getSchema(): CredentialIssuanceTypedViewModelSchema<T>;
}

export type CredentialIssuanceTypedViewModelSchema<T extends IssuanceCredentialType> = {
  type: T,
  schema: CredentialIssuanceViewModelSchema
};

export type SelectorOption  = { label: string, value: string};

export type CredentialIssuanceViewModelSchema = CredentialIssuanceViewModelGroupField[];
export type CredentialIssuanceViewModelSchemaWithId = CredentialIssuanceViewModelGroupFieldWithId[];


export type IssuanceStaticViewModel = {
    mandator?: { key: string, value: string }[];
}

export type IssuanceViewModelsTuple = [CredentialIssuanceViewModelSchemaWithId, IssuanceStaticViewModel];

// Data collected in Issuance component (form) and sent to request factory
export interface IssuanceRawCredentialPayload {
  formData: Record<string, any>, 
  staticData: IssuanceStaticViewModel | null,
  asSigner: boolean //todo rename "onBehalf" here and across all the app
}

// Power component types
export type IssuanceRawPowerForm = Partial<Record<TmfFunction, Record<TmfAction, boolean>>>;

export interface IssuanceFormPowerSchema{
  //todo: in the future, if there are multiple domains, add a "domain" field (currently there is only "DOME")
  function: string,
  action: string[],
  isIn2Required: boolean
}

// Key component and service types
export interface KeyState {
  desmosPrivateKeyValue: string,
  desmosDidKeyValue: string
}

export interface KeyForm{
  didKey: FormControl<string>,
}