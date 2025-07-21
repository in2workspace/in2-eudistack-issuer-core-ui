import { LEARCredential, LEARCredentialJwtPayload, LifeCycleStatus } from "../entity/lear-credential";

export interface CredentialProcedureDetailsResponse {
  procedure_id: string;
  lifeCycleStatus: LifeCycleStatus;
  credential: LEARCredentialJwtPayload | LEARCredential;
} 