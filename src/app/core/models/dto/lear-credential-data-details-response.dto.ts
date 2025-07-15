import { LEARCredential, LEARCredentialJwtPayload } from "../entity/lear-credential";

export interface CredentialProcedureDataDetailsResponse {
  procedure_id: string;
  lifeCycleStatus: string;
  credential: LEARCredentialJwtPayload | LEARCredential;
}