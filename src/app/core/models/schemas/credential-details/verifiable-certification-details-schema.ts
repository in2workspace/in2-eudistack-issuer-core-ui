import { isVerifiable, mapComplianceEntries } from "src/app/features/credential-details/helpers/credential-details-helpers";
import { VerifiableCertification, LEARCredential } from "../../entity/lear-credential";
import { ViewModelSchema } from "../../entity/lear-credential-details";
import { commonIssuerDetailsField } from "./issuer-details-field";

export const VerifiableCertificationDetailsViewModelSchema: ViewModelSchema = {
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
        commonIssuerDetailsField
      ]
    }
  ]
};