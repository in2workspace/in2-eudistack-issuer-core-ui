import { RawFormPower } from "src/app/features/credential-issuance-two/credential-issuance-two/credential-issuance-two.component";
import { EmployeeMandatee, EmployeeMandator, Power, TmfAction } from "../entity/lear-credential";

// data enviada per component
export interface RawCredentialPayload {
        partialCredentialSubject: Record<string, any>, 
        power: RawFormPower, 
        optional: {keys?:any, staticData:{mandator:EmployeeMandator}|null}, //todo tipar més
        asSigner: boolean
      }
export interface RawCredentialPayloadWithParsedPower extends Omit<RawCredentialPayload, 'power'>{
    power: IssuancePayloadPower[];
}

//interfaces enviades a API
export interface IssuancePayloadPower extends Power {
    action: TmfAction[]
}

export type LearCredentialIssuancePayload = LearCredentialMachineIssuancePayload | LearCredentialEmployeeIssuancePayload;

export interface BaseLEARCredentialIssuancePayload {}

export interface LearCredentialMachineIssuancePayload extends BaseLEARCredentialIssuancePayload {
    //it should probably be the same as in credentials, but details interface has to be updated first
    mandator: {
        id: string, //did-elsi //todo organization?
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

export interface LearCredentialEmployeeIssuancePayload extends BaseLEARCredentialIssuancePayload{
      mandatee: EmployeeMandatee;
      mandator: EmployeeMandator;
      power: IssuancePayloadPower[];
}