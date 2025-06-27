import { ComplianceEntry, GxLabelCredential, LEARCredential, Power, VerifiableCertification } from "src/app/core/models/entity/lear-credential";
import { DetailsGroupField, DetailsKeyValueField } from "src/app/core/models/schemas/credential-details-schemas";

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
    console.log(res);
    return res;
  }

  export function mapComplianceEntries(
  compliances: ComplianceEntry[]
): DetailsGroupField[] {
  return compliances.map(comp => ({
    key: comp.id,
    type: 'group',
    // Ara .value és l'array de subfields
    value: [
      mapKV('hash', comp.hash),
      mapKV('scope', comp.scope),
      mapKV('standard', comp.standard),
    ]
  }));
}

/** Petit helper per crear un DetailsKeyValueField */
function mapKV(key: string, value: any): DetailsKeyValueField {
  return { key, type: 'key-value', value };
}

export function isVerifiable(c: LEARCredential): c is VerifiableCertification {
  return 'compliance' in c.credentialSubject;
}

export function isGxLabel(c: LEARCredential): c is GxLabelCredential {
  return c.type.includes('GxLabelCredential');
}