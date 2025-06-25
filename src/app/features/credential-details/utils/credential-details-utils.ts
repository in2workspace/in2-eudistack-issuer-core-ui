import { CredentialDetailsFormFieldSchema, CredentialDetailsFormSchema, GxLabelCredentialDetailsFormSchema, LearCredentialEmployeeDetailsFormSchema, LearCredentialMachineDetailsFormSchema, VerifiableCertificationDetailsFormSchema } from '../../../core/models/entity/lear-credential-details-schemas';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CredentialFormData, CredentialType, Power, LEARCredential, LEARCredentialEmployee, LEARCredentialMachine, VerifiableCertification, GxLabelCredential } from 'src/app/core/models/entity/lear-credential';

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
  },

  GxLabelCredential: (credential) => {
    const c = credential as GxLabelCredential;

    return {
      issuer: { id: c.issuer},
      basic: {
        id: c.id,
        "gx:labelLevel": c.credentialSubject['gx:labelLevel'],
        "gx:engineVersion": c.credentialSubject['gx:engineVersion'],
        "gx:rulesVersion": c.credentialSubject['gx:rulesVersion']
      },
      "gx:compliantCredentials": c.credentialSubject['gx:compliantCredentials'],
      "gx:validatedCriteria": c.credentialSubject['gx:validatedCriteria']
    }
  }
};

export const FormSchemaByType: Record<CredentialType, CredentialDetailsFormSchema> = {
    LEARCredentialEmployee: LearCredentialEmployeeDetailsFormSchema,
    LEARCredentialMachine: LearCredentialMachineDetailsFormSchema,
    VerifiableCertification: VerifiableCertificationDetailsFormSchema,
    GxLabelCredential: GxLabelCredentialDetailsFormSchema
  };
  
  export function getFormSchemaByType(type: CredentialType): CredentialDetailsFormSchema {
    const schema = FormSchemaByType[type];
    if (!schema) {
      throw new Error(`Unsupported credential type: ${type}`);
    }
    return schema;
  }

  export function buildFormFromSchema(
    fb: FormBuilder,
    schema: CredentialDetailsFormSchema,
    data: any
  ): FormGroup {
    const group: Record<string, any> = {};
  
    for (const key in schema) {
      const field = schema[key];
  
      if(shouldSkip(key, field, data)) continue;

      if (isComplianceGroup(key, field)) {
        group[key] = buildComplianceGroup(fb, data?.[key]);
      } else if(isGxValidatedCriteriaGroup(key, field)) {
        group[key] = buildValidatedCriteriaGroup(fb, data?.[key]);
      } else if(isGxCompliantCredentialsGroup(key, field)){
        group[key] = buildCompliantCredentialsGroup(fb, data?.[key]);
      } else if (isPowerGroup(key, field)) {
        group[key] = buildPowerGroup(fb, data?.[key]);
      } else if (field.type === 'control') {
        group[key] = new FormControl(data?.[key] ?? null);
      } else if (field.type === 'group') {
        group[key] = buildFormFromSchema(fb, field.fields!, data?.[key]);
      }
    }
  
    return fb.group(group);
  }

  export function shouldSkip(key: string, field: CredentialDetailsFormFieldSchema, data: any): boolean {
    return (
      key === 'issuer' &&
      field.type === 'group' &&
      (!data.issuer && (!data?.issuer?.id || data.issuer.id === ''))
    );
  }
  export function isGxValidatedCriteriaGroup(key: string, field: CredentialDetailsFormFieldSchema){
    return key === 'gx:validatedCriteria' && field.type === 'group';
  }

  export function isGxCompliantCredentialsGroup(key: string, field: CredentialDetailsFormFieldSchema){
    return key === 'gx:compliantCredentials' && field.type === 'group';
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

// todo set as array for showing as table
export function buildCompliantCredentialsGroup(
  fb: FormBuilder,
  compliantCredentials: any
): FormGroup {
  if (!Array.isArray(compliantCredentials)) {
    throw new Error('compliantCredentials must be an array of objects');
  }

  const groupConfig: { [key: string]: FormGroup } = {};

  compliantCredentials.forEach((cred, idx) => {
    if (typeof cred !== 'object' || cred === null) {
      throw new Error(`compliantCredentials[${idx}] must be an object`);
    }

    const { id, type, 'gx:digestSRI': gxDigestSRI } = cred as {
      id: any;
      type: any;
      'gx:digestSRI': any;
    };

    if (typeof id !== 'string') {
      throw new Error(`compliantCredentials[${idx}].id must be a string`);
    }
    if (typeof type !== 'string') {
      throw new Error(`compliantCredentials[${idx}].type must be a string`);
    }
    if (typeof gxDigestSRI !== 'string') {
      throw new Error(
        `compliantCredentials[${idx}]['gx:digestSRI'] must be a string`
      );
    }

    groupConfig[id] = fb.group({
      type: new FormControl(type),
      gxDigestSRI: new FormControl(gxDigestSRI),
    });
  });

  return fb.group(groupConfig);
}

  export function buildValidatedCriteriaGroup(fb: FormBuilder, validatedCriteria: any): FormGroup {
  
    if (!Array.isArray(validatedCriteria)) {
      throw new Error('validatedCriteria must be an array of strings');
    }

    const groupConfig: { [key: string]: FormControl } = {};

    validatedCriteria.forEach((value, index) => {
      if (typeof value !== 'string') {
        throw new Error(`validatedCriteria[${index}] must be a string`);
      }
      groupConfig[index.toString()] = fb.control(value);
    });
  
    return fb.group(groupConfig);
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
