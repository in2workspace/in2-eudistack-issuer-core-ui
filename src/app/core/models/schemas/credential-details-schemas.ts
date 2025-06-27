import { ComponentPortal } from "@angular/cdk/portal";
import { InjectionToken } from "@angular/core";
import { GxLabelCredential, LEARCredential, LEARCredentialEmployee, LEARCredentialMachine, VerifiableCertification } from "src/app/core/models/entity/lear-credential";
import { CompliantCredentialsComponent, compliantCredentialsToken } from "src/app/features/credential-details/components/compliant-credentials/compliant-credentials.component";
import { URL_LIST_TOKEN, UrlListComponent } from "src/app/features/credential-details/components/url-list/url-list.component";
import { groupActionsByFunction, isVerifiable, mapComplianceEntries, isGxLabel } from "src/app/features/credential-details/helpers/credential-details-helpers";

export type DetailsCredentialType = 'LEARCredentialEmployee' | 'LEARCredentialMachine' | 'VerifiableCertification' | 'GxLabelCredential';

export type DetailsField = DetailsKeyValueField | DetailsGroupField;

export type ExtendedDetailsField = ExtendedDetailsGroupField | ExtendedDetailsKeyValueField;
export type ExtendedDetailsGroupField = DetailsGroupField & { portal?: ComponentPortal<any>; };
export type ExtendedDetailsKeyValueField = DetailsKeyValueField & { portal?: ComponentPortal<any>; };

export type MappedDetailsField = MappedDetailsKeyValueField | MappedDetailsGroupField;
export type MappedDetailsKeyValueField = DetailsKeyValueField & { value: MappedDetailsField[] }
export type MappedDetailsGroupField = DetailsGroupField & { value: MappedDetailsField[] }

// export type MappedExtendedDetailsField = MappedExtendedDetailsGroupField | MappedExtendedDetailsField;
export type MappedExtendedDetailsGroupField = ExtendedDetailsGroupField & { value: MappedDetailsField[] }
export type MappedExtendedDetailsField = ExtendedDetailsField & { value: MappedDetailsField[] }

export type DetailsKeyValueField = {
  key?: string;
  type: 'key-value';
  value: any;
  custom?: CustomDetailsField;
};
export type DetailsGroupField = {
  key?: string;
  type: 'group';
  custom?: CustomDetailsField;
  value: DetailsField[] | ((c: LEARCredential) => DetailsField[]);
};
export type CustomDetailsField = {
  component: any;
  token: InjectionToken<any>;
  value: any;
};
export type TemplateSchema = {
  main: DetailsField[];
  side: DetailsField[];
};
export type MappedTemplateSchema = {
  main: MappedDetailsField[],
  side: MappedDetailsField[]
}

export const LearCredentialEmployeeDetailsTemplateSchema: TemplateSchema = {
  main: [
    {
      key: 'mandatee',
      type: 'group',
      value: [
        { key: 'name', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandatee.firstName + ' ' +c.credentialSubject.mandate.mandatee.lastName },
        { key: 'email', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandatee.email },
        { key: 'nationality', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandatee.nationality }
      ]
    },
    {
      key: 'mandator',
      type: 'group',
      value: [
        { key: 'name', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.commonName},
        { key: 'email', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.emailAddress },
        { key: 'serialNumber', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.serialNumber},
        { key: 'organization', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.organization },
        { key: 'organizationId', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.organizationIdentifier },
        { key: 'country', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.country }
    ]
    },
    {
      key: 'power',
      type: 'key-value',
      value: (c: LEARCredentialEmployee) => groupActionsByFunction(c.credentialSubject.mandate.power)
    }
  ],
  side: [
    {
      key: 'issuer',
      type: 'group',
      value: [
        { key: 'name', type: 'key-value', value: (c: LEARCredentialEmployee) => c.issuer?.commonName },
        { key: 'serialNumber', type: 'key-value', value: (c: LEARCredentialEmployee) => c.issuer?.serialNumber },
        { key: 'organization', type: 'key-value', value: (c: LEARCredentialEmployee) => c.issuer?.organization  },
        { key: 'organizationId', type: 'key-value', value: (c: LEARCredentialEmployee) => c.issuer?.organizationIdentifier },
        { key: 'country', type: 'key-value', value: (c: LEARCredentialEmployee) => c.issuer?.country }
      ]
    }
  ]
};

export const LearCredentialMachineDetailsTemplateSchema: TemplateSchema = {
  main: [
    {
      key: 'mandatee',
      type: 'group',
      value: [
        { key: 'id', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandatee.id },
        { key: 'domain', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandatee.domain },
        { key: 'ipAddress', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandatee.ipAddress }
      ]
    },
    {
      key: 'mandator',
      type: 'group',
      value: [
        { key: 'name', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandator.commonName},
        { key: 'email', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandator.emailAddress },
        { key: 'serialNumber', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandator.serialNumber},
        { key: 'organization', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandator.organization },
        { key: 'organizationId', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandator.organizationIdentifier },
        { key: 'country', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandator.country }
    ]
    },
    {
      key: 'power',
      type: 'key-value',
      value: (c: LEARCredentialMachine) => groupActionsByFunction(c.credentialSubject.mandate.power)
    }
  ],
  side: [
    {
      key: 'issuer',
      type: 'group',
      value: [
        { key: 'name', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.commonName },
        { key: 'email', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.commonName },
        { key: 'serialNumber', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.serialNumber },
        { key: 'organization', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.organization  },
        { key: 'organizationId', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.organizationIdentifier },
        { key: 'country', type: 'key-value', value: (c: LEARCredentialMachine) => c.issuer?.country }
      ]
    }
  ]
};

export const VerifiableCertificationDetailsTemplateSchema: TemplateSchema = {
  main: [
    {
      key: 'company',
      type: 'group',
      value: [
        {
          key: 'id',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.credentialSubject.company.id
        },
        {
          key: 'commonName',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.credentialSubject.company.commonName
        },
        {
          key: 'organization',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.credentialSubject.company.organization
        },
        {
          key: 'country',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.credentialSubject.company.country
        },
        {
          key: 'email',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.credentialSubject.company.email
        },
        {
          key: 'address',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.credentialSubject.company.address
        }
      ]
    },
    {
      key: 'product',
      type: 'group',
      value: [
        {
          key: 'productId',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.credentialSubject.product.productId
        },
        {
          key: 'productName',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.credentialSubject.product.productName
        },
        {
          key: 'productVersion',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.credentialSubject.product.productVersion
        }
      ]
    },
    {
      key: 'compliance',
      type: 'group',
      value: (c: LEARCredential) => {
        if (!isVerifiable(c)) return [];
        return mapComplianceEntries(c.credentialSubject.compliance);
      }
    }
  ],
  side: [
    {
      key: 'attester',
      type: 'group',
      value: [
        {
          key: 'id',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.attester.id
        },
        {
          key: 'firstName',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.attester.firstName
        },
        {
          key: 'lastName',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.attester.lastName
        },
        {
          key: 'organization',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.attester.organization
        },
        {
          key: 'organizationIdentifier',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.attester.organizationIdentifier
        },
        {
          key: 'country',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.attester.country
        }
      ]
    },
    {
      key: 'issuer',
      type: 'group',
      value: [
        {
          key: 'commonName',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.issuer?.commonName
        },
        {
          key: 'organization',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.issuer?.organization
        },
        {
          key: 'country',
          type: 'key-value',
          value: (c: VerifiableCertification) => c.issuer?.country
        }
      ]
    }
  ]
};

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
