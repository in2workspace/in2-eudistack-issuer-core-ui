import { LEARCredential, LEARCredentialJwtPayload } from "../entity/lear-credential";

export interface LEARCredentialDataDetailsResponse {
  procedure_id: string;
  credential_status: string;
  credential: LEARCredentialJwtPayload | LEARCredential;
}