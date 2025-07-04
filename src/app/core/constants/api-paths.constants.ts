//todo why API and API_PATH?
export const API_PATH = Object.freeze({
    PROCEDURES: '/api/v1/procedures',
    SAVE_CREDENTIAL: '/api/v1/credentials?type=LEARCredentialEmployee',
    CREDENTIAL_OFFER: '/api/v1/credential-offer',
    NOTIFICATION: '/api/v1/notifications',
    CONFIGURATION: '/backoffice/v1/configuration',
    SIGNATURE_CONFIG:'/backoffice/v1/signatures/configs',
    CLOUD_PROVIDER:'/backoffice/v1/signatures/cloud-providers',
    REVOKE: '/backoffice/v1/credentials/status/revoke'
});
