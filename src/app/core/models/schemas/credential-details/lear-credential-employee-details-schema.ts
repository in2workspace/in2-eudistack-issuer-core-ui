import { groupActionsByFunction } from "src/app/features/credential-details/helpers/credential-details-helpers";
import { LEARCredentialEmployee } from "../../entity/lear-credential";
import { ViewModelSchema } from "../../entity/lear-credential-details";
import { DetailsPowerComponent, detailsPowerToken } from "src/app/features/credential-details/components/details-power/details-power.component";
import { commonIssuerDetailsField } from "./common-issuer-details-field";

// todo
export const LearCredentialEmployeeDetailsViewModelSchema: ViewModelSchema = {
  main: [
    {
      key: 'mandator',
      type: 'group',
      value: [
        { key: 'name', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.commonName},
        { key: 'email', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.email },
        { key: 'serialNumber', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.serialNumber},
        { key: 'organization', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.organization },
        { key: 'organizationId', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.organizationIdentifier },
        { key: 'country', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandator.country }
      ]
    },
    {
      key: 'mandatee',
      type: 'group',
      value: [
        { key: 'name', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandatee.firstName + ' ' +c.credentialSubject.mandate.mandatee.lastName },
        { key: 'empployeeId', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandatee.employeeId },
        { key: 'email', type: 'key-value', value: (c: LEARCredentialEmployee) => c.credentialSubject.mandate.mandatee.email }      ]
    },
    {
      key: 'power',
      type: 'group',
      custom: {
        component: DetailsPowerComponent,
        token: detailsPowerToken,
        value: (c: LEARCredentialEmployee) => groupActionsByFunction(c.credentialSubject.mandate.power)
      },
      value: []
    }
  ],
  side: [
    commonIssuerDetailsField
  ]
};