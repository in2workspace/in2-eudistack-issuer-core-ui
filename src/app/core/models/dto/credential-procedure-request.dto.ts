import { EmployeeMandatee, EmployeeMandator, StrictPower } from "../entity/lear-credential";

export interface EmployeeProcedureRequest {
    schema: string,
    format: string,
    payload: LearCredentialEmployeePayload,
    operation_mode: string,
    validity_period?: number,
    response_uri?: string
}

export interface LearCredentialEmployeePayload {
  mandator: EmployeeMandator;
  mandatee: EmployeeMandatee;
  power: StrictPower[];
}
