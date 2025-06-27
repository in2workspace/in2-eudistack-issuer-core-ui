import { CredentialStatus } from "src/app/core/models/entity/lear-credential";
import { DetailsCredentialType } from "src/app/core/models/schemas/credential-details-schemas";

const credentialTypeHasSendReminderButtonArr: DetailsCredentialType[] = ['LEARCredentialEmployee', 'gx:LabelCredential'];
const credentialTypeHasSignCredentialButtonArr: DetailsCredentialType[] = ['LEARCredentialEmployee', 'VerifiableCertification', 'gx:LabelCredential'];

const statusHasSendReminderButtonArr: CredentialStatus[] = ['WITHDRAWN', 'DRAFT', 'PEND_DOWNLOAD'];
const statusHasSingCredentialButtonArr: CredentialStatus[] = ['PEND_SIGNATURE'];

export function credentialTypeHasSendReminderButton(type: DetailsCredentialType): boolean{
    return credentialTypeHasSendReminderButtonArr.includes(type);
}

export function credentialTypeHasSignCredentialButton(type: DetailsCredentialType): boolean{
    return credentialTypeHasSignCredentialButtonArr.includes(type);
}

export function statusHasSendReminderlButton(status: CredentialStatus): boolean{
    return statusHasSendReminderButtonArr.includes(status);
}

export function statusHasSignCredentialButton(status: CredentialStatus): boolean{
    return statusHasSingCredentialButtonArr.includes(status);
}