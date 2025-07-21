import { CredentialProcedureDetailsResponse } from './../dto/credential-procedure-details-response.dto';
import { ComponentPortal } from "@angular/cdk/portal";
import { InjectionToken } from "@angular/core";
import { LEARCredential, LEARCredentialJwtPayload } from "./lear-credential";

export interface CredentialProcedureDetails extends CredentialProcedureDetailsResponse{
  credential: LEARCredentialJwtPayload;
}

export type DetailsField = DetailsKeyValueField | DetailsGroupField;

export type ExtendedDetailsField = ExtendedDetailsGroupField | ExtendedDetailsKeyValueField;
export type ExtendedDetailsGroupField = DetailsGroupField & { portal?: ComponentPortal<any>; };
export type ExtendedDetailsKeyValueField = DetailsKeyValueField & { portal?: ComponentPortal<any>; };

export type MappedDetailsField = MappedDetailsKeyValueField | MappedDetailsGroupField;
export type MappedDetailsKeyValueField = DetailsKeyValueField & { value: MappedDetailsField[] }
export type MappedDetailsGroupField = DetailsGroupField & { value: MappedDetailsField[] }

export type MappedExtendedDetailsGroupField = ExtendedDetailsGroupField & { value: MappedDetailsField[] }
export type MappedExtendedDetailsField = ExtendedDetailsField & { value: MappedDetailsField[] }

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

export type TemplateSchema = {
  main: DetailsGroupField[];
  side: DetailsGroupField[];
};
export type MappedTemplateSchema = {
  main: MappedDetailsField[],
  side: MappedDetailsField[]
}
