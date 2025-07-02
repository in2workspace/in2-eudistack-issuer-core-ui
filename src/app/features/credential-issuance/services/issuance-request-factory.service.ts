import { IssuanceRawCredentialPayload, IssuanceRawCredentialPayloadWithParsedPower } from './../../../core/models/dto/lear-credential-issuance-request.dto';
import { Injectable } from '@angular/core';
import { IssuancePayloadPower, IssuanceLEARCredentialEmployeePayload, IssuanceLEARCredentialPayload, IssuanceLEARCredentialMachinePayload } from 'src/app/core/models/dto/lear-credential-issuance-request.dto';
import { TmfAction, TmfFunction } from 'src/app/core/models/entity/lear-credential';
import { IssuanceRawPowerForm } from '../components/credential-issuance/credential-issuance.component';
import { IssuanceCredentialType } from 'src/app/core/models/entity/lear-credential-issuance';

@Injectable({
  providedIn: 'root'
})
export class IssuanceRequestFactoryService {

  private constructor() { }

  public createCredentialRequest(
      credentialData: IssuanceRawCredentialPayload, 
      credentialType: IssuanceCredentialType,
    ): IssuanceLEARCredentialPayload{
      //Parse power
      const parsedPower: IssuancePayloadPower[] = this.parsePower(credentialData.power, credentialType);
      const credentialDataWithParsedPower:IssuanceRawCredentialPayloadWithParsedPower = { ...credentialData, power: parsedPower };

      //Build credential request payload
      if(credentialType === 'LEARCredentialEmployee'){
        return this.createLearCredentialEmployeeRequest(credentialDataWithParsedPower);
      }else if(credentialType === 'LEARCredentialMachine'){
        return this.createLearCredentialMachineRequest(credentialDataWithParsedPower);
      }else{
        console.error('Unexpected credential type');
        return {} as IssuanceLEARCredentialPayload;
      }
    }

     private createLearCredentialEmployeeRequest(credentialData: IssuanceRawCredentialPayloadWithParsedPower): IssuanceLEARCredentialEmployeePayload{
      console.log('CREATE LEAR CREDENTIAL EMPLOYEE');
      console.log('Credential data: ');
      console.log(credentialData);
      // Mandatee
      const mandatee = this.getMandateeFromCredentialData(credentialData);
      
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
          power: credentialData.power
        }
        return payload;
    }

    private createLearCredentialMachineRequest(credentialData: IssuanceRawCredentialPayloadWithParsedPower): IssuanceLEARCredentialMachinePayload{
      console.log('CREATE LEAR CREDENTIAL MACHINE');
      console.log('Credential data: ');
      console.log(credentialData);
      // Mandatee
      const mandatee = this.getMandateeFromCredentialData(credentialData);
      
      // Mandator
      const mandator = this.getMandatorFromCredentialData(credentialData);
      if(!mandator){
        console.error('Error getting mandator.'); 
        return {} as IssuanceLEARCredentialMachinePayload;
      }
      const country = mandator['country'];
      const orgId = mandator['organizationIdentifier'];
      const mandatorId = this.buildDidElsi(country, orgId); //did-elsi
      const mandatorCommonName = mandator['commonName'] ?? this.buildCommonName(mandator['firstName'], mandator['lastName']);
      
      const didKey = credentialData.optional['keys']['desmosDidKeyValue'];

      const payload: IssuanceLEARCredentialMachinePayload =    
        {
        mandator: {
          commonName:  mandatorCommonName,
          serialNumber:  mandator['serialNumber'],
          organization: mandator['organization'],
          id: mandatorId,
          country:  mandator['country'],
        },
        mandatee: {
            id:  didKey,
            domain:  mandatee['domain'],
            ipAddress:  mandatee["ipAddress"]
        },
        power: credentialData.power
      }
      return payload;
    }

    private buildDidElsi(orgId: string, country: string): string{
      const vatNumber = this.buildOrganizationId(orgId, country);
      return "did:elsi:" + vatNumber;
    }

    private buildOrganizationId(country: string, vatNumber: string): string{
      const hasVAT = this.checkIfHasVAT(vatNumber);
      return  hasVAT ? vatNumber : ("VAT" + country + '-' + vatNumber);
    }

    private checkIfHasVAT(orgId: string){
      const regex = /^VAT..-/;
      return regex.test(orgId);
    }

    private buildCommonName(name: string, lastName: string){
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

        // construïm el payload combinant base + accions filtrades
        const parsed: IssuancePayloadPower = {
          ...base,
          action: selectedActions
        };

        return [...acc, parsed];
      }, []);
    }

private getMandatorFromCredentialData(credentialData: IssuanceRawCredentialPayloadWithParsedPower){
  return credentialData.asSigner ? credentialData.partialCredentialSubject['mandator'] : credentialData.optional.staticData?.mandator;
}
    
private getMandateeFromCredentialData(credentialData: IssuanceRawCredentialPayloadWithParsedPower){
  return credentialData.partialCredentialSubject['mandatee'];
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