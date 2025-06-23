import { Injectable } from '@angular/core';
import { IssuancePayloadPower, LearCredentialEmployeeIssuancePayload, LearCredentialIssuancePayload, LearCredentialMachineIssuancePayload, RawCredentialPayload, RawCredentialPayloadWithParsedPower } from 'src/app/core/models/dto/lear-credential-issuance-request.dto';
import { CredentialType, TmfAction, TmfFunction } from 'src/app/core/models/entity/lear-credential';
import { RawFormPower } from '../components/credential-issuance-two/credential-issuance-two.component';

@Injectable({
  providedIn: 'root'
})
export class IssuanceRequestFactoryService {

  constructor() { }

  public createCredentialRequest(
      credentialData: RawCredentialPayload, 
      credentialType: CredentialType,
    ): LearCredentialIssuancePayload{
      //Parse power
      const parsedPower: IssuancePayloadPower[] = this.parsePower(credentialData.power, credentialType);
      const credentialDataWithParsedPower:RawCredentialPayloadWithParsedPower = { ...credentialData, power: parsedPower };

      //Build credential request payload
      if(credentialType === 'LEARCredentialEmployee'){
        return this.createLearCredentialEmployeeRequest(credentialDataWithParsedPower);
      }else if(credentialType === 'LEARCredentialMachine'){
        return this.createLearCredentialMachineRequest(credentialDataWithParsedPower);
      }else{
        //todo
        console.error('Unexpected credential type');
        return {} as LearCredentialIssuancePayload;
      }
    }

    private createLearCredentialMachineRequest(credentialData: RawCredentialPayloadWithParsedPower): LearCredentialMachineIssuancePayload{
      console.log('CREATE LEAR CREDENTIAL MACHINE');
      console.log('Credential data: ');
      console.log(credentialData);
      // Mandatee
      const mandatee = this.getMandateeFromCredentialData(credentialData);
      
      // Mandator
      const mandator = this.getMandatorFromCredentialData(credentialData);
      if(!mandator){
        console.error('Error getting mandator.'); 
        return {} as LearCredentialMachineIssuancePayload;
      }
      const country = mandator['country'];
      const orgId = mandator['organizationIdentifier'];
      const mandatorId = this.buildDidElsi(country, orgId); //did-elsi
      const mandatorCommonName = mandator['commonName'] ?? this.buildCommonName(mandator['firstName'], mandator['lastName']);
      
      const didKey = credentialData.optional['keys']['desmosDidKeyValue'];

      const payload: LearCredentialMachineIssuancePayload =    
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

    //todo
    private createLearCredentialEmployeeRequest(credentialData: RawCredentialPayloadWithParsedPower): LearCredentialEmployeeIssuancePayload{
      console.log('CREATE LEAR CREDENTIAL EMPLOYEE');
      console.log('Credential data: ');
      console.log(credentialData);
      // Mandatee
      const mandatee = this.getMandateeFromCredentialData(credentialData);
      
      // Mandator
      const mandator = this.getMandatorFromCredentialData(credentialData);
      if(!mandator){
        console.error('Error getting mandator.'); 
        return {} as LearCredentialEmployeeIssuancePayload;
      }
      const country = mandator['country'];
      const orgId = mandator['organizationIdentifier'];
      const vatNumber = this.buildOrganizationId(country, orgId);
      const mandatorCommonName = mandator['commonName'] ?? this.buildCommonName(mandator['firstName'], mandator['lastName']);
      

      const payload: LearCredentialEmployeeIssuancePayload =    
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

    private buildDidElsi(orgId:string, country:string): string{
      const vatNumber = this.buildOrganizationId(orgId, country);
      return "did:elsi:" + vatNumber;
    }

    private buildOrganizationId(country:string, vatNumber:string): string{
      return "VAT" + country + '-' + vatNumber;
    }

    private buildCommonName(name:string, lastName:string){
      return name + ' ' + lastName;
    }

    private parsePower(
      power: RawFormPower,
      credType: CredentialType
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

private getMandatorFromCredentialData(credentialData:RawCredentialPayloadWithParsedPower){
  return credentialData.asSigner ? credentialData.partialCredentialSubject['mandator'] : credentialData.optional.staticData?.mandator;
}
    
private getMandateeFromCredentialData(credentialData:RawCredentialPayloadWithParsedPower){
  return credentialData.partialCredentialSubject['mandatee'];
}
}

const domePowerBase = {
  type: "domain",
  domain: "DOME"
}

const powerMap: Record<CredentialType, Partial<Record<TmfFunction, IssuancePayloadPower>>> = {
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
          },
          // todo remove
        //           'ProductOffering': {
        //   ...domePowerBase,
        //   function: 'ProductOffering',
        //   action: ['Create', 'Update', 'Upload']
        // },
        // 'Certification': {
        //   ...domePowerBase,
        //   function: 'Certification',
        //   action: ['Attest', 'Upload']
        // }
      },
      'VerifiableCertification': {}
    }