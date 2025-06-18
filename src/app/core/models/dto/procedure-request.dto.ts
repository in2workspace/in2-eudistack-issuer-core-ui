import { EmployeeMandatee, EmployeeMandator, StrictPower } from "../entity/lear-credential";

export interface LearCredentialProcedureRequest {
    schema: string,
    format: string,
    payload: LearCredentialPayload,
    operation_mode: string,
    validity_period?: number,
    response_uri?: string
}

//todo
export interface LearCredentialPayload {
  mandator: EmployeeMandator;
  mandatee: EmployeeMandatee;
  power: StrictPower[];
}