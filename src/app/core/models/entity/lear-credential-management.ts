import { CredentialProcedure } from "../dto/procedure-response.dto";

export interface CredentialProcedureWithClass extends CredentialProcedure {
  statusClass: string;
}

export const STATUSES_WITH_DEFINED_CLASS = [
    'VALID',
    'DRAFT',
    'EXPIRED',
    'REVOKED'
  ] as const;

export type DefinedStatusClass = typeof STATUSES_WITH_DEFINED_CLASS[number];

export type ToSlug<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Lowercase<Head>}-${ToSlug<Tail>}`
    : Lowercase<S>;

export type StatusClassFromDefined = `status-${ToSlug<DefinedStatusClass>}`;

export type StatusClass = StatusClassFromDefined | 'status-default';