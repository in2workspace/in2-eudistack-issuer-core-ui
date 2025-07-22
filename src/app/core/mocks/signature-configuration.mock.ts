export const issuerConfiguration={
    "enableRemoteSignature": "true",
    "signatureMode": "CLOUD"
}


export const providersMock = [
  {
    id: 'd2281001-a757-411d-91f5-ce16ddcd2bee',
    provider: 'DIGITEL',
    url: 'www.digitel.com',
    authMethod: 'Oauth2',
    authGrantType: 'clientCredentials.',
    requiresTOTP: true,
  },
  {
    id: 'f0a0ee81-b785-4230-9b4b-4e0e59609e21',
    provider: 'Test_1 prov',
    url: 'www.prueba2.com',
    authMethod: 'Oauth2',
    authGrantType: 'clientCredentials.',
    requiresTOTP: true,
  },
  {
    id: '7521f592-e72b-4839-aeea-89255337b7b0',
    provider: 'Test_23 prov',
    url: 'www.prueba2.com',
    authMethod: 'Oauth2',
    authGrantType: 'clientCredentials.',
    requiresTOTP: true,
  },
];

export const signatureConfigurationCloud=[
    {
        "id": "36470c04-b8f7-40b0-9cce-ce0a58e665e0",
        "organizationIdentifier": "VATES-B60645900",
        "enableRemoteSignature": true,
        "signatureMode": "CLOUD",
        "cloudProviderId": "d2281001-a757-411d-91f5-ce16ddcd2bee",
        "clientId": "mi-cliente",
        "credentialId": "cred-001",
        "credentialName": "NEW CREDENTIAL"
    },
   
]