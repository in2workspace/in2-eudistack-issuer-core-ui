import { CompliantCredentialsComponent, compliantCredentialsToken } from "src/app/features/credential-details/components/compliant-credentials/compliant-credentials.component";
import { UrlListComponent, URL_LIST_TOKEN } from "src/app/features/credential-details/components/url-list/url-list.component";
import { isGxLabel } from "src/app/features/credential-details/helpers/credential-details-helpers";
import { GxLabelCredential, LEARCredential } from "../../entity/lear-credential";
import { TemplateSchema, DetailsKeyValueField } from "../../entity/lear-credential-details";

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
      key: 'gx:validatedCriteria',
      type: 'group',
      custom: {
        component: UrlListComponent,
        token: URL_LIST_TOKEN,
        value: (c: LEARCredential) => { 
          if(!isGxLabel(c)) return [];
          const criteria = c.credentialSubject['gx:validatedCriteria'] ?? [];
          const mappedCriteria: DetailsKeyValueField[] = criteria.map(c => {
            return { type: 'key-value', value: c } 
          });
          return mappedCriteria;
        }
      },
      value: []
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