import { CompliantCredentialsComponent, compliantCredentialsToken } from "src/app/features/credential-details/components/compliant-credentials/compliant-credentials.component";
import { isGxLabel } from "src/app/features/credential-details/helpers/credential-details-helpers";
import { GxLabelCredential, LEARCredential } from "../../entity/lear-credential";
import { DetailsField, TemplateSchema } from "../../entity/lear-credential-details";

export const GxLabelCredentialDetailsTemplateSchema: TemplateSchema = {
  main: [
    {
      key: 'basic',
      type: 'group',
      value: [
        {
          key: 'id',
          type: 'key-value',
          value: (c: GxLabelCredential) => c.credentialSubject.id
        },
        {
          key: 'gx:labelLevel',
          type: 'key-value',
          // currently we need to map "BL" to "Base Level"
          value: (c: GxLabelCredential) => { return c.credentialSubject['gx:labelLevel'] === 'BL' ? "Base Level" : c.credentialSubject['gx:labelLevel']}
        },
        {
          key: 'gx:engineVersion',
          type: 'key-value',
          value: (c: GxLabelCredential) => c.credentialSubject['gx:engineVersion']
        },
        {
          key: 'gx:rulesVersion',
          type: 'key-value',
          value: (c: LEARCredential) => {
            if(!isGxLabel(c)) return [];
            return c.credentialSubject['gx:rulesVersion']
          }
        }
      ]
    },
    {
      key: 'gx:compliantCredentials',
      type: 'group',
      value: [],
      custom: {
        component: CompliantCredentialsComponent,
        token: compliantCredentialsToken,
        value: (c: LEARCredential) => {
        if(!isGxLabel(c)) return [];
        return c.credentialSubject['gx:compliantCredentials'];
      }
      }
    },
    {
      // Currently it shows the base URL of the received URLs, since they are not valid at the moment
      // todo: consider hiding or showing differently

      key: 'gx:validatedCriteriaReference',
      type: 'group',
      value: (c: LEARCredential) => { 
            if (!isGxLabel(c)) return [];

        const criteria: (string | undefined)[] =
          c.credentialSubject['gx:validatedCriteria'] ?? [];

        if (criteria.length === 0) {
          return [{ type: 'key-value', value: null }];
        }

        const regex = /\/criterion\/[^/]+$/;

        const cleanUrls = criteria
          .map((url) => url?.replace(regex, ''))
          .filter((url): url is string => !!url);

        const uniqueCleanUrls = Array.from(new Set(cleanUrls));

        const fields: DetailsField[] = uniqueCleanUrls.map((cleanUrl) => ({
          type: 'key-value',
          value: cleanUrl,
        }));
        return fields
      }
    }
  ],
  side: [
    {
      key: 'issuer',
      type: 'group',
      value: [
        {
          key: 'id',
          type: 'key-value',
          value: (c: GxLabelCredential) => c.issuer
        }
      ]
    }
  ]
};