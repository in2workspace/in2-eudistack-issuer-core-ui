import { LEARCredential } from "../../entity/lear-credential";
import { DetailsGroupField } from "../../entity/lear-credential-details";

//expected to be a json or a string (in this case, the value is set as "id")
export const commonIssuerDetailsField: DetailsGroupField = {
  key: 'issuer',
  type: 'group',
  value: (c: LEARCredential) => {
    if (typeof c.issuer === 'string') {
      const s = c.issuer;
      return [
        { key: 'id', type: 'key-value', value: () => s }
      ];
    }

    const i = c.issuer;
    return [
      { key: 'id',             type: 'key-value', value: () => i?.id },
      { key: 'name',           type: 'key-value', value: () => i?.commonName },
      { key: 'email',          type: 'key-value', value: () => i?.emailAddress },
      { key: 'serialNumber',   type: 'key-value', value: () => i?.serialNumber },
      { key: 'organization',   type: 'key-value', value: () => i?.organization },
      { key: 'organizationId', type: 'key-value', value: () => i?.organizationIdentifier },
      { key: 'country',        type: 'key-value', value: () => i?.country },
    ];
  }
};