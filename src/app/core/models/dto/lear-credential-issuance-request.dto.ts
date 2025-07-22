import { EmployeeMandatee, EmployeeMandator, Power, TmfAction } from "../entity/lear-credential";
import { IssuanceStaticDataSchema } from "../entity/lear-credential-issuance";

// data enviada per component
export interface IssuanceRawCredentialPayload {
        partialCredentialSubject: Record<string, any>, 
        optional: { staticData: IssuanceStaticDataSchema | null },
        asSigner: boolean
}

//interfaces enviades a API
export interface IssuancePayloadPower extends Power {
    action: TmfAction[]
}

export type IssuanceLEARCredentialPayload = IssuanceLEARCredentialMachinePayload | IssuanceLEARCredentialEmployeePayload;

export interface IssuanceBaseLEARCredentialPayload {}

export interface IssuanceLEARCredentialMachinePayload extends IssuanceBaseLEARCredentialPayload {
    //it should probably be the same as in credentials, but details interface has to be updated first
    mandator: {
        id: string, //did-elsi
        organization: string,
        country: string,
        commonName: string,
        serialNumber: string
    },
    //it should probably be the same as in credentials, but details interface has to be updated first
    mandatee: {
        id: string, //did-key
        domain: string,
        ipAddress: string
    },
    power: IssuancePayloadPower[]
}

export interface IssuanceLEARCredentialEmployeePayload extends IssuanceBaseLEARCredentialPayload{
      mandatee: EmployeeMandatee;
      mandator: EmployeeMandator;
      power: IssuancePayloadPower[];
}

export interface IssuanceLEARCredentialRequestDto {
    schema: string,
    format: string,
    payload: IssuanceLEARCredentialPayload,
    operation_mode: string,
    validity_period?: number,
    response_uri?: string
}