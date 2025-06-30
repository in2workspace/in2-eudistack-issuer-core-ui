import { ComponentPortal } from "@angular/cdk/portal";
import { InjectionToken } from "@angular/core";
import { LEARCredential } from "./lear-credential";

export type DetailsField = DetailsKeyValueField | DetailsGroupField;

export type ExtendedDetailsField = ExtendedDetailsGroupField | ExtendedDetailsKeyValueField;
export type ExtendedDetailsGroupField = DetailsGroupField & { portal?: ComponentPortal<any>; };
export type ExtendedDetailsKeyValueField = DetailsKeyValueField & { portal?: ComponentPortal<any>; };

export type MappedDetailsField = MappedDetailsKeyValueField | MappedDetailsGroupField;
export type MappedDetailsKeyValueField = DetailsKeyValueField & { value: MappedDetailsField[] }
export type MappedDetailsGroupField = DetailsGroupField & { value: MappedDetailsField[] }

// export type MappedExtendedDetailsField = MappedExtendedDetailsGroupField | MappedExtendedDetailsField;
export type MappedExtendedDetailsGroupField = ExtendedDetailsGroupField & { value: MappedDetailsField[] }
export type MappedExtendedDetailsField = ExtendedDetailsField & { value: MappedDetailsField[] }

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

//todo set main and side as DetailsGroupFields[]; this requires changing power to group type
export type TemplateSchema = {
  main: DetailsGroupField[];
  side: DetailsGroupField[];
};
export type MappedTemplateSchema = {
  main: MappedDetailsField[],
  side: MappedDetailsField[]
}
