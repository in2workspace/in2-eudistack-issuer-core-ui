import { ComponentPortal } from "@angular/cdk/portal";
import { InjectionToken } from "@angular/core";
import { LEARCredential } from "./lear-credential";

export type DetailsField = DetailsKeyValueField | DetailsGroupField;

// Extended fields have had mapped the "custom" field
export type ExtendedDetailsField = ExtendedDetailsGroupField | ExtendedDetailsKeyValueField;
export type ExtendedDetailsGroupField = DetailsGroupField & { portal?: ComponentPortal<any>; };
export type ExtendedDetailsKeyValueField = DetailsKeyValueField & { portal?: ComponentPortal<any>; };

// Evaluated fields have had mapped the "value" field
export type EvaluatedDetailsField = EvaluatedDetailsKeyValueField | EvaluatedDetailsGroupField;
export type EvaluatedDetailsKeyValueField = DetailsKeyValueField & { value: EvaluatedDetailsField[] }
export type EvaluatedDetailsGroupField = DetailsGroupField & { value: EvaluatedDetailsField[] }

export type EvaluatedExtendedDetailsGroupField = ExtendedDetailsGroupField & { value: EvaluatedDetailsField[] }
export type EvaluatedExtendedDetailsField = ExtendedDetailsField & { value: EvaluatedDetailsField[] }

//todo: separate custom and value (which contains value) in different interfaces, or handle differently
export type DetailsKeyValueField = {
  key?: string;
  type: 'key-value';
  value: any;
  custom?: CustomDetailsField;
};
export type DetailsGroupField = {
  key?: string;
  type: 'group';
  custom?: CustomDetailsField;
  value: DetailsField[] | ((c: LEARCredential) => DetailsField[]);
};
export type CustomDetailsField = {
  component: any;
  token: InjectionToken<any>;
  value: any;
};

export type ViewModelSchema = {
  main: DetailsGroupField[];
  side: DetailsGroupField[];
};
export type EvaluatedViewModelSchema = {
  main: EvaluatedDetailsField[],
  side: EvaluatedDetailsField[]
}
