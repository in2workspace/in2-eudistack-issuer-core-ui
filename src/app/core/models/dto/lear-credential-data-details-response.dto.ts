import { LEARCredential, LEARCredentialJwtPayload } from "../entity/lear-credential";

export interface CredentialProcedureDetailsResponse {
  procedure_id: string;
  lifeCycleStatus: string;
  credential: LEARCredentialJwtPayload | LEARCredential;
}