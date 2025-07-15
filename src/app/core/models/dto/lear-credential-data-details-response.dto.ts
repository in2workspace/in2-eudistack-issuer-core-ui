import { LEARCredential, LEARCredentialJwtPayload } from "../entity/lear-credential";

export interface LEARCredentialDataDetailsResponse {
  procedure_id: string;
  lifeCycleStatus: string;
  credential: LEARCredentialJwtPayload | LEARCredential;
}