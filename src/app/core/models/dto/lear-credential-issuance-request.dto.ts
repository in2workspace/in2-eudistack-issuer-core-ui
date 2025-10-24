import { EmployeeMandatee, EmployeeMandator, Power, TmfAction } from "../entity/lear-credential";

export interface IssuanceLEARCredentialRequestDto {
    schema: string,
    format: string,
    payload: IssuanceLEARCredentialPayload,
    operation_mode: string,
    validity_period?: number,
    response_uri?: string,
    credential_subject_email?: string
}

export type IssuanceLEARCredentialPayload = IssuanceLEARCredentialMachinePayload | IssuanceLEARCredentialEmployeePayload;

//interfaces enviades a API
export interface IssuancePayloadPower extends Power {
    action: TmfAction[]
}


//it should probably be the same as in credential details, but details feature/interface has to be updated first
export interface IssuanceLEARCredentialMachinePayload {
    mandator: {
        id: string, //did-elsi
        organizationIdentifier: string,
        commonName: string,
        email: string,
        serialNumber: string
        organization: string,
        country: string,
    },
    mandatee: {
        id: string, //did-key
        domain: string,
        ipAddress: string
    },
    power: IssuancePayloadPower[]
}

export interface IssuanceLEARCredentialEmployeePayload {
      mandatee: EmployeeMandatee;
      mandator: EmployeeMandator;
      power: IssuancePayloadPower[];
}