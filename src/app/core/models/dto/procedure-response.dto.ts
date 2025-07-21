
export interface ProcedureResponse {
  credential_procedures: CredentialProcedure[];
}

export interface CredentialProcedure {
  credential_procedure: {
    procedure_id: string;
    subject: string;
    credential_type: string; //ideally, this should be CredentialProcedureType
    status: string;
    updated: string;
  }
}

export type CredentialProcedureType = 'LABEL_CREDENTIAL' | 'LEAR_CREDENTIAL_EMPLOYEE' | 'LEAR_CREDENTIAL_MACHINE' | 'VERIFIABLE_CERTIFICATION';

