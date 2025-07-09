import { CredentialStatus } from "../entity/lear-credential";

export interface ProcedureResponse {
  credential_procedures: CredentialProcedure[];
}

export interface CredentialProcedure {
  credential_procedure: {
    procedure_id: string;
    subject: string;
    credential_type: string;
    status: CredentialStatus;
    updated: string;
  }
}

