import { Injectable } from '@angular/core';
import { IssuancePayloadPower, IssuanceLEARCredentialEmployeePayload, IssuanceLEARCredentialPayload, IssuanceLEARCredentialMachinePayload } from 'src/app/core/models/dto/lear-credential-issuance-request.dto';
import { EmployeeMandatee, TmfAction, TmfFunction } from 'src/app/core/models/entity/lear-credential';
import { IssuanceCredentialType, IssuanceRawCredentialPayload, IssuanceRawPowerForm } from 'src/app/core/models/entity/lear-credential-issuance';

@Injectable({
  providedIn: 'root'
})
export class IssuanceRequestFactoryService {
  private readonly credentialRequestFactoryMap: Record<IssuanceCredentialType, (credData: IssuanceRawCredentialPayload) => IssuanceLEARCredentialPayload> = {
    LEARCredentialEmployee: (data) => this.createLearCredentialEmployeeRequest(data),
    LEARCredentialMachine: (data) => this.createLearCredentialMachineRequest(data)
  }

  public createCredentialRequest(
      credentialData: IssuanceRawCredentialPayload, 
      credentialType: IssuanceCredentialType,
    ): IssuanceLEARCredentialPayload{

     return this.credentialRequestFactoryMap[credentialType](credentialData);
    }

  private createLearCredentialEmployeeRequest(credentialData: IssuanceRawCredentialPayload): IssuanceLEARCredentialEmployeePayload{
    // Power
    const parsedPower = this.parsePower(credentialData.formData['power'], 'LEARCredentialEmployee');
    
    // Mandatee
    const mandatee = this.getMandateeFromCredentialData(credentialData) as unknown as EmployeeMandatee;
    
    // Mandator
    const mandator = this.getMandatorFromCredentialData(credentialData);
    if(!mandator){
      console.error('Error getting mandator.'); 
      return {} as IssuanceLEARCredentialEmployeePayload;
    }
    const country = mandator['country'];
    const orgId = mandator['organizationIdentifier'];
    const vatNumber = this.buildOrganizationId(country, orgId);
    const mandatorCommonName = mandator['commonName'] ?? this.buildCommonName(mandator['firstName'], mandator['lastName']);
    
    // Payload
    const payload: IssuanceLEARCredentialEmployeePayload =    
      {
      mandator: {
            emailAddress: mandator['emailAddress'],
            organization: mandator['organization'],
            country:  country,
            commonName:  mandatorCommonName,
            serialNumber:  mandator['serialNumber'],
            organizationIdentifier: vatNumber
        },
        mandatee: {
            ...mandatee
        },
        power: parsedPower
      }
      return payload;
  }

  private createLearCredentialMachineRequest(credentialData: IssuanceRawCredentialPayload): IssuanceLEARCredentialMachinePayload{
    // Power
    const parsedPower = this.parsePower(credentialData.formData['power'], 'LEARCredentialEmployee');

    // Mandatee
    const mandatee = this.getMandateeFromCredentialData(credentialData);
    
    // Mandator
    const mandator = this.getMandatorFromCredentialData(credentialData);
    if(!mandator){
      console.error('Error getting mandator.'); 
      return {} as IssuanceLEARCredentialMachinePayload;
    }
    const country = mandator['country'];
    const orgIdSuffix = mandator['organizationIdentifier'];
    const orgId = this.buildOrganizationId(country, orgIdSuffix);
    const mandatorId = this.buildDidElsi(orgId, country);
    const mandatorCommonName = mandator['commonName'] ?? this.buildCommonName(mandator['firstName'], mandator['lastName']);
    const mandatorEmail = mandator['email'] ?? mandator['emailAddress'];

    const didKey = credentialData.formData['keys']['didKey'];

    // Payload
    const payload: IssuanceLEARCredentialMachinePayload =    
      {
      mandator: {
        commonName:  mandatorCommonName,
        serialNumber:  mandator['serialNumber'],
        email: mandatorEmail, 
        organization: mandator['organization'],
        id: mandatorId,
        organizationIdentifier: orgId,
        country:  mandator['country'],
      },
      mandatee: {
          id:  didKey,
          domain:  mandatee['domain'],
          ipAddress:  mandatee["ipAddress"]
      },
      power: parsedPower
    }
    return payload;
  }

  private buildDidElsi(orgId: string, country: string): string{
    return "did:elsi:" + orgId;
  }

  private buildOrganizationId(country: string, orgIdSuffix: string): string{
    const hasVAT = this.checkIfHasVAT(orgIdSuffix);
    return  hasVAT ? orgIdSuffix : ("VAT" + country + '-' + orgIdSuffix);
  }

  private checkIfHasVAT(orgId: string){
    const regex = /^VAT..-/;
    return regex.test(orgId);
  }

  private buildCommonName(name: string, lastName: string): string{
    return name + ' ' + lastName;
  }

  private parsePower(
    power: IssuanceRawPowerForm,
    credType: IssuanceCredentialType
  ): IssuancePayloadPower[] {
    return Object.entries(power).reduce<IssuancePayloadPower[]>((acc, [funct, pow]) => {
      const tmfFunc = funct as TmfFunction;
      const base = powerMap[credType]?.[tmfFunc];

      if (!base) {
        console.error('Function key found in schema but not in received data: ' + funct);
        return acc;
      }
      
      const selectedActions = (Object.entries(pow) as [TmfAction, boolean][])
        .filter(([_, enabled]) => enabled)
        .map(([action]) => action);

      if (selectedActions.length === 0) {
        console.error('Not actions found for this key: ' + funct);
        return acc;
      }

      const parsed: IssuancePayloadPower = {
        ...base,
        action: selectedActions
      };

      return [...acc, parsed];
    }, []);
  }

private getMandatorFromCredentialData(credentialData: IssuanceRawCredentialPayload): Record<string, string>{
  if(!credentialData.asSigner){
    const unparsedMandator = credentialData.staticData?.mandator;
    if(!unparsedMandator) throw Error('Could not get valid mandator as signer');
    return Object.fromEntries(unparsedMandator.map(item => [item.key, item.value]));
  }
  return credentialData.formData['mandator'];
}
    
private getMandateeFromCredentialData(credentialData: IssuanceRawCredentialPayload): Record<string, string>{
  return credentialData.formData['mandatee'];
}
}

const domePowerBase = {
  type: "domain",
  domain: "DOME"
}

const powerMap: Record<IssuanceCredentialType, Partial<Record<TmfFunction, IssuancePayloadPower>>> = {
      'LEARCredentialEmployee': {
        'Onboarding': {
          ...domePowerBase,
          function: 'Onboarding',
          action: ['Execute']
        },
        'ProductOffering': {
          ...domePowerBase,
          function: 'ProductOffering',
          action: ['Create', 'Update', 'Upload']
        },
        'Certification': {
          ...domePowerBase,
          function: 'Certification',
          action: ['Attest', 'Upload']
        }
      },
      'LEARCredentialMachine': {
          'Onboarding': {
            ...domePowerBase,
            function: 'Onboarding',
            action: ['Execute']
          }
      },
    }