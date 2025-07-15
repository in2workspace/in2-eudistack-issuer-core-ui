//todo why API and API_PATH?
export const API_PATH = Object.freeze({
    CREDENTIAL_OFFER: '/oid4vci/v1/credential-offer',
    CLOUD_PROVIDER:'/backoffice/v1/signatures/cloud-providers',
    CONFIGURATION: '/backoffice/v1/configuration',
    NOTIFICATION: '/api/v1/notifications',
    PROCEDURES: '/api/v1/procedures',
    REVOKE: '/backoffice/v1/credentials/status/revoke',
    SAVE_CREDENTIAL: '/backoffice/v1/issuances',
    SIGNATURE_CONFIG:'/backoffice/v1/signatures/configs',
    SIGN_CREDENTIAL: '/api/v1/retry-sign-credential'
});
