import { CredentialStatus, CredentialType } from "src/app/core/models/entity/lear-credential";

const credentialTypeHasSendReminderButtonArr: CredentialType[] = ['LEARCredentialEmployee', 'gx:LabelCredential'];
const credentialTypeHasSignCredentialButtonArr: CredentialType[] = ['LEARCredentialEmployee', 'VerifiableCertification', 'gx:LabelCredential'];

const statusHasSendReminderButtonArr: CredentialStatus[] = ['WITHDRAWN', 'DRAFT', 'PEND_DOWNLOAD'];
const statusHasSingCredentialButtonArr: CredentialStatus[] = ['PEND_SIGNATURE'];

export function credentialTypeHasSendReminderButton(type: CredentialType): boolean{
    return credentialTypeHasSendReminderButtonArr.includes(type);
}

export function credentialTypeHasSignCredentialButton(type: CredentialType): boolean{
    return credentialTypeHasSignCredentialButtonArr.includes(type);
}

export function statusHasSendReminderlButton(status: CredentialStatus): boolean{
    return statusHasSendReminderButtonArr.includes(status);
}

export function statusHasSignCredentialButton(status: CredentialStatus): boolean{
    return statusHasSingCredentialButtonArr.includes(status);
}