import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CredentialFormData, CredentialType, Power, LEARCredential, LEARCredentialEmployee, LEARCredentialMachine, VerifiableCertification } from 'src/app/core/models/entity/lear-credential';
import { CredentialDetailsFormSchema, LearCredentialEmployeeDetailsFormSchema, LearCredentialMachineDetailsFormSchema, VerifiableCertificationDetailsFormSchema, CredentialDetailsFormFieldSchema } from 'src/app/core/models/schemas/lear-credential-details-schemas';

type ComplianceEntry = {
  id: string;
  hash: string;
  scope: string;
};

type ComplianceMap = Record<string, ComplianceEntry>;

export const FormDataExtractorByType: Record<CredentialType, (credential: LEARCredential) => any> = {
  LEARCredentialEmployee: (credential) => {
    const c = credential as LEARCredentialEmployee;
    return {
      issuer: c.issuer,
      mandatee: c.credentialSubject.mandate.mandatee,
      mandator: c.credentialSubject.mandate.mandator,
      power: mapPowerArrayByFunction(c.credentialSubject.mandate.power)
    };
  },

  LEARCredentialMachine: (credential) => {
    const c = credential as LEARCredentialMachine;
    return {
      issuer: c.issuer,
      mandatee: c.credentialSubject.mandate.mandatee,
      mandator: c.credentialSubject.mandate.mandator,
      power: mapPowerArrayByFunction(c.credentialSubject.mandate.power)
    };
  },

  VerifiableCertification: (credential) => {
    const c = credential as VerifiableCertification;
  
    const complianceEntries: ComplianceMap = c.credentialSubject.compliance.reduce(
      (acc, item) => {
        const { standard, ...rest } = item;
        acc[standard] = rest;
        return acc;
      },
      {} as ComplianceMap
    );
  
    return {
      issuer: c.issuer,
      attester: c.attester,
      company: c.credentialSubject.company,
      product: c.credentialSubject.product,
      compliance: complianceEntries,
    };
  }
};

export const FormSchemaByType: Record<CredentialType, CredentialDetailsFormSchema> = {
    LEARCredentialEmployee: LearCredentialEmployeeDetailsFormSchema,
    LEARCredentialMachine: LearCredentialMachineDetailsFormSchema,
    VerifiableCertification: VerifiableCertificationDetailsFormSchema
  };
  
  export function getFormSchemaByType(type: CredentialType): CredentialDetailsFormSchema {
    const schema = FormSchemaByType[type];
    if (!schema) {
      throw new Error(`Unsupported credential type: ${type}`);
    }
    return schema;
  }

  export function detailsFormBuilder(
    fb: FormBuilder,
    schema: CredentialDetailsFormSchema,
    data: any
  ): FormGroup {
    const group: Record<string, any> = {};
  
    for (const key in schema) {
      const field = schema[key];
  
      if (shouldSkipIssuer(key, field, data)) continue;
  
      if (isComplianceGroup(key, field)) {
        group[key] = buildComplianceGroup(fb, data?.[key]);
      } else if (isPowerGroup(key, field)) {
        group[key] = buildPowerGroup(fb, data?.[key]);
      } else if (field.type === 'control') {
        group[key] = new FormControl(data?.[key] ?? null);
      } else if (field.type === 'group') {
        group[key] = detailsFormBuilder(fb, field.fields!, data?.[key]);
      }
    }
  
    return fb.group(group);
  }
  
  export function shouldSkipIssuer(key: string, field: CredentialDetailsFormFieldSchema, data: any): boolean {
    return (
      key === 'issuer' &&
      field.type === 'group' &&
      (!data?.issuer?.id || data.issuer.id === '')
    );
  }
  
  export function isComplianceGroup(key: string, field: CredentialDetailsFormFieldSchema): boolean {
    return key === 'compliance' && field.type === 'group';
  }
  
  export function isPowerGroup(key: string, field: CredentialDetailsFormFieldSchema): boolean {
    return key === 'power' && field.type === 'group';
  }
  
  export function buildComplianceGroup(fb: FormBuilder, complianceData: any): FormGroup {
    const group: Record<string, FormGroup> = {};
  
    for (const standard in complianceData ?? {}) {
      const item = complianceData[standard];
      group[standard] = fb.group({
        id: new FormControl(item.id),
        hash: new FormControl(item.hash),
        scope: new FormControl(item.scope),
      });
    }
  
    return fb.group(group);
  }
  
  export function buildPowerGroup(fb: FormBuilder, powerData: any): FormGroup {
    const group: Record<string, FormGroup> = {};
  
    for (const func in powerData ?? {}) {
      const actionGroup: Record<string, FormControl> = {};
  
      for (const action in powerData[func]) {
        actionGroup[action] = new FormControl(true);
      }
  
      group[func] = fb.group(actionGroup);
    }
  
    return fb.group(group);
  }
  
export function getFormDataByType<T extends CredentialType>(
  credential: LEARCredential,
  type: T
): CredentialFormData {
  const extractor = FormDataExtractorByType[type];
  if (!extractor) {
    throw new Error(`Unsupported data extractor for type: ${type}`);
  }
  return extractor(credential) as CredentialFormData;
}

export function mapPowerArrayByFunction(power: Power[]): Record<string, Record<string, true>> {
  const grouped: Record<string, Record<string, true>> = {};

  for (const entry of power) {
    const actions = Array.isArray(entry.action) ? entry.action : [entry.action];
    const func = entry.function;

    if (!grouped[func]) grouped[func] = {};
    for (const action of actions) {
      grouped[func][action] = true;
    }
  }

  return grouped;
}
