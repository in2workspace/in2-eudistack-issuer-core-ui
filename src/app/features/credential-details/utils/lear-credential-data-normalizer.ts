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

  /**
   * Normalizes the complete LEARCredential object.
   * It applies normalization to the mandatee object and each element of the power array.
   */
public normalizeLearCredential(data: LEARCredential): LEARCredential {
  const normalizedData: any = { ...data };

  if (normalizedData.credentialSubject && typeof normalizedData.credentialSubject === 'object') {
    normalizedData.credentialSubject = { ...normalizedData.credentialSubject };
  }

  const credentialTypes = normalizedData.type;
  const isEmployee = Array.isArray(credentialTypes) && credentialTypes.includes('LEARCredentialEmployee');
  const isMachine = Array.isArray(credentialTypes) && credentialTypes.includes('LEARCredentialMachine');
  const isVerifiableCertification = Array.isArray(credentialTypes) && credentialTypes.includes('VerifiableCertification');

  if ((isEmployee || isMachine) && normalizedData.credentialSubject && 'mandate' in normalizedData.credentialSubject) {
    const originalMandate = normalizedData.credentialSubject.mandate;
    normalizedData.credentialSubject.mandate = { ...originalMandate };
    const mandate = normalizedData.credentialSubject.mandate;

    if (isEmployee && mandate.mandatee) {
      mandate.mandatee = this.normalizeEmployeeMandatee(mandate.mandatee as RawEmployeeMandatee);
    }

    if (Array.isArray(mandate.power)) {
      mandate.power = mandate.power.map((p:Power) => this.normalizePower(p));
    }
  }

  if (isVerifiableCertification && 'atester' in normalizedData) {
    const rawData = normalizedData as RawVerifiableCertification;
    if (rawData.atester) {
      rawData.attester = rawData.atester;
      delete rawData.atester;
    }
  }

  return normalizedData;
}

  
  

  /**
 * Normalizes the mandatee object by unifying "firstName"/"first_name" and "lastName"/"last_name" keys.
 */
private normalizeEmployeeMandatee(data: RawEmployeeMandatee): EmployeeMandatee {
  return <EmployeeMandatee>{
    firstName: data.firstName ?? data.first_name,
    lastName: data.lastName ?? data.last_name,
    email: data.email,
    nationality: data.nationality
  };
}

/**
 * Normalizes a power object by unifying keys like "action"/"tmf_action", "domain"/"tmf_domain", etc.
 */
private normalizePower(data: RawPower): Power {
  return <Power>{
    action: data.action ?? data.tmf_action,
    domain: data.domain ?? data.tmf_domain,
    function: data.function ?? data.tmf_function,
    type: data.type ?? data.tmf_type
  };
}
}
