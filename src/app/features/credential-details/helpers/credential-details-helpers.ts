import { ComplianceEntry, GxLabelCredential, LEARCredential, Power, VerifiableCertification } from "src/app/core/models/entity/lear-credential";
import { DetailsGroupField, DetailsKeyValueField } from "src/app/core/models/entity/lear-credential-details";

export interface FunctionActions {
  function: string; 
  actions: string[];
}

export function groupActionsByFunction(powers: Power[]): FunctionActions[] {
    const map = powers.reduce<Record<string, Set<string>>>((acc, { function: fn, action }) => {
      const actions = Array.isArray(action) ? action : [action];

      if (!acc[fn]) {
        acc[fn] = new Set();
      }
      actions.forEach(a => acc[fn].add(a));
      return acc;
    }, {});

    const res = Object.entries(map).map(([fn, actionsSet]) => ({
      function: fn,
      actions: Array.from(actionsSet),
    }));
    return res;
  }

  export function mapComplianceEntries(
  compliances: ComplianceEntry[]
): DetailsGroupField[] {
  return compliances.map(comp => ({
    key: comp.id,
    type: 'group',
    value: [
      mapKeyValue('hash', comp.hash),
      mapKeyValue('scope', comp.scope),
      mapKeyValue('standard', comp.standard),
    ]
  }));
}

function mapKeyValue(key: string, value: any): DetailsKeyValueField {
  return { key, type: 'key-value', value };
}

export function isVerifiable(c: LEARCredential): c is VerifiableCertification {
  return 'compliance' in c.credentialSubject;
}

export function isGxLabel(c: LEARCredential): c is GxLabelCredential {
  return c.type.includes('gx:LabelCredential');
}