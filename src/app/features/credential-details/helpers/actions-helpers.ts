import { CredentialType, LifeCycleStatus } from "src/app/core/models/entity/lear-credential";

const credentialTypeHasSendReminderButtonArr: CredentialType[] = ['LEARCredentialEmployee', 'LEARCredentialMachine', 'gx:LabelCredential'];
const credentialTypeHasSignCredentialButtonArr: CredentialType[] = ['LEARCredentialEmployee', 'LEARCredentialMachine', 'gx:LabelCredential'];
const credentialTypeHasRevokeCredentialButtonArr: CredentialType[] = ['LEARCredentialEmployee', 'LEARCredentialMachine', 'gx:LabelCredential'];

const statusHasSendReminderButtonArr: LifeCycleStatus[] = ['WITHDRAWN', 'DRAFT', 'PEND_DOWNLOAD'];
const statusHasSingCredentialButtonArr: LifeCycleStatus[] = ['PEND_SIGNATURE'];
const statusHasRevokeCredentialButtonArr: LifeCycleStatus[] = ['VALID'];

export function credentialTypeHasSendReminderButton(type: CredentialType): boolean{
    return credentialTypeHasSendReminderButtonArr.includes(type);
}

export function credentialTypeHasSignCredentialButton(type: CredentialType): boolean{
    return credentialTypeHasSignCredentialButtonArr.includes(type);
}

export function credentialTypeHasRevokeCredentialButton(type: CredentialType): boolean{
    return credentialTypeHasRevokeCredentialButtonArr.includes(type);
}

export function statusHasSendReminderlButton(status: LifeCycleStatus): boolean{
    return statusHasSendReminderButtonArr.includes(status);
}

export function statusHasSignCredentialButton(status: LifeCycleStatus): boolean{
    return statusHasSingCredentialButtonArr.includes(status);
}

export function statusHasRevokeCredentialButton(status: LifeCycleStatus): boolean{
    return statusHasRevokeCredentialButtonArr.includes(status);
}