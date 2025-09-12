import { LEARCredentialMachine } from "../../entity/lear-credential";
import { DetailsGroupField } from "../../entity/lear-credential-details";

//expected to be a json or a string (in this case, the value is set as "id")
export const issuerDetailsField: DetailsGroupField = {
      key: 'issuer',
      type: 'group',
      value: [
        { key: 'id', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.id ?? c.issuer },
        { key: 'name', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.commonName },
        { key: 'email', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.emailAddress },
        { key: 'serialNumber', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.serialNumber },
        { key: 'organization', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.organization  },
        { key: 'organizationId', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.organizationIdentifier },
        { key: 'country', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.country }
      ]
    };