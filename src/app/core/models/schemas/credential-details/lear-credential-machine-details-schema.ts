import { groupActionsByFunction } from "src/app/features/credential-details/helpers/credential-details-helpers";
import { LEARCredentialMachine } from "../../entity/lear-credential";
import { ViewModelSchema } from "../../entity/lear-credential-details";
import { DetailsPowerComponent, detailsPowerToken } from "src/app/features/credential-details/components/details-power/details-power.component";

export const LearCredentialMachineDetailsViewModelSchema: ViewModelSchema = {
  main: [
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
      key: 'mandatee',
      type: 'group',
      value: [
        { key: 'id', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandatee.id },
        { key: 'domain', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandatee.domain },
        { key: 'ipAddress', type: 'key-value', value: (c: LEARCredentialMachine) => c.credentialSubject.mandate.mandatee.ipAddress }
      ]
    },
    // change to group - custom
    {
      key: 'power',
      type: 'group',
      custom: {
        component: DetailsPowerComponent,
        token: detailsPowerToken,
        value: (c: LEARCredentialMachine) => groupActionsByFunction(c.credentialSubject.mandate.power)
      },
      value: []
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