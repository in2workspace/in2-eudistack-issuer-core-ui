import { LifeCycleStatus } from "../entity/lear-credential";

export interface CredentialProceduresResponse {
  credential_procedures: CredentialProcedure[];
}

export interface CredentialProcedure {
  credential_procedure: {
    procedure_id: string;
    subject: string;
    credential_type: CredentialProcedureType;
    status: LifeCycleStatus;
    updated: string;
    owner_email: string;
    organization: string;
  }
}

export type CredentialProcedureType = 'LABEL_CREDENTIAL' | 'LEAR_CREDENTIAL_EMPLOYEE' | 'LEAR_CREDENTIAL_MACHINE' | 'VERIFIABLE_CERTIFICATION';

