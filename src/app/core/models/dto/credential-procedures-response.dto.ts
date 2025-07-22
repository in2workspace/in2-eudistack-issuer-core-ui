
export interface CredentialProceduresResponse {
  credential_procedures: CredentialProcedure[];
}

export interface CredentialProcedure {
  credential_procedure: {
    procedure_id: string;
    subject: string;
    credential_type: string; //ideally, this should be CredentialProcedureType
    status: string; //ideally, this should be CredentialProcedureStatus
    updated: string;
  }
}

export type CredentialProcedureType = 'LABEL_CREDENTIAL' | 'LEAR_CREDENTIAL_EMPLOYEE' | 'LEAR_CREDENTIAL_MACHINE' | 'VERIFIABLE_CERTIFICATION';

