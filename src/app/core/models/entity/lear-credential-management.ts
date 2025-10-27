import { CredentialProcedureBasicInfo } from "../dto/credential-procedures-response.dto";


export interface CredentialProcedureWithClass extends CredentialProcedureBasicInfo {
  statusClass: string;
}

export const STATUSES_WITH_DEFINED_CLASS = [
    'VALID',
    'DRAFT',
    'EXPIRED',
    'REVOKED'
  ] as const;

export type DefinedStatusClass = typeof STATUSES_WITH_DEFINED_CLASS[number];

// This creates types 'X_Y' to 'status-x-y"; it used to create status classes from status
export type ToSlug<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Lowercase<Head>}-${ToSlug<Tail>}`
    : Lowercase<S>;

export type StatusClassFromDefined = `status-${ToSlug<DefinedStatusClass>}`;

export type StatusClass = StatusClassFromDefined | 'status-default';

const filters = ["subject", "organizationIdentifier"] as const;
export type Filter = typeof filters[number];

export type FilterConfig = {
  filterName: Filter;
  translationLabel: string;
  placeholderTranslationLabel: string;
}