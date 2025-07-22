import { LEARCredential, EmployeeMandatee, Power, VerifiableCertification, Attester } from './../../../core/models/entity/lear-credential';

// Interfaces for the raw JSON of Mandatee and Power
interface RawEmployeeMandatee {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email?: string;
  nationality?: string;
}

interface RawPower {
  action?: string | string[];
  tmf_action?: string | string[];
  domain?: string;
  tmf_domain?: string;
  function?: string;
  tmf_function?: string;
  type?: string;
  tmf_type?: string;
}

interface RawVerifiableCertification extends VerifiableCertification{
  atester?: Attester;
}

export class LEARCredentialDataNormalizer {

  public normalizeLearCredential(data: LEARCredential): LEARCredential {
    // clonem superficialment l’input
    console.log('normalizeLearCredential; data: ')
    console.log(data)
    const normalized: any = { ...data };
    if (normalized.credentialSubject && typeof normalized.credentialSubject === 'object') {
      normalized.credentialSubject = { ...normalized.credentialSubject };
    }

    // Calcular flags LOCALMENT
    const types = Array.isArray(normalized?.type) ? normalized.type : [];
    const isEmployee = types.includes('LEARCredentialEmployee');
    const isMachine  = types.includes('LEARCredentialMachine');
    const isVerCert  = types.includes('VerifiableCertification');

    // Normalitzacions segons flags
    this.normalizeMandateIfNeeded(normalized, isEmployee, isMachine);
    this.normalizeCertificationIfNeeded(normalized, isVerCert);

    return normalized;
  }

  private normalizeMandateIfNeeded(
    data: any,
    isEmployee: boolean,
    isMachine: boolean
  ) {
    if (!(isEmployee || isMachine)) return;
    const sub = data.credentialSubject;
    if (!sub || !('mandate' in sub)) return;

    sub.mandate = { ...sub.mandate };
    if (isEmployee && sub.mandate.mandatee) {
      sub.mandate.mandatee = this.normalizeEmployeeMandatee(sub.mandate.mandatee);
    }
    if (Array.isArray(sub.mandate.power)) {
      sub.mandate.power = sub.mandate.power.map((p: RawPower) => this.normalizePower(p));
    }
  }

  private normalizeCertificationIfNeeded(
    data: any,
    isVerCert: boolean
  ) {
    if (!isVerCert || !('atester' in data)) return;
    const raw = data as RawVerifiableCertification;
    if (!raw.atester) return;
    raw.attester = raw.atester;
    delete raw.atester;
  }

private normalizeEmployeeMandatee(data: RawEmployeeMandatee): EmployeeMandatee {
  const firstName = data.firstName ?? data.first_name ?? "";
  const lastName  = data.lastName ?? data.last_name ?? "";
  const email     = data.email ?? "";
  const nationality = data.nationality ?? "";

  console.log('normalizeEmployeeMandatee')
  console.log(firstName, lastName, email, nationality);


  return { firstName, lastName, email, nationality };
}

private normalizePower(data: RawPower): Power {
  const action = data.action   ?? data.tmf_action ?? '';
  const domain = data.domain   ?? data.tmf_domain ?? '';
  const func   = data.function ?? data.tmf_function ?? '';
  const type   = data.type     ?? data.tmf_type ?? '';

  if (!action) {
    console.warn('Missing power action. Using default: ""');
  }
  if (!domain) {
    console.warn('Missing power domain. Using default:  ""');
  }
  if (!func) {
    console.warn('Missing power function. Using default:  ""');
  }
  if (!type) {
    console.warn('Missing power type. Using default:  ""');
  }

  return {
    action,
    domain,
    function: func,
    type
  };
}

}
