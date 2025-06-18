import { LearCredentialIssuancePayload } from "./lear-credential-issuance-request.dto";


export interface LearCredentialIssuanceRequestDto {
    schema: string,
    format: string,
    payload: LearCredentialIssuancePayload,
    operation_mode: string,
    validity_period?: number,
    response_uri?: string
}