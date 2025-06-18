import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { CredentialType, EmployeeMandator } from 'src/app/core/models/entity/lear-credential';
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema, getLearCredentialEmployeeIssuanceFormSchemas, getLearCredentialMachineIssuanceFormSchemas } from 'src/app/core/models/entity/lear-credential-issuance-schemas';
import { CountryService } from 'src/app/shared/components/form-credential/services/country.service';
import { ALL_VALIDATORS_FACTORY_MAP, ValidatorEntry } from 'src/app/shared/validators/credential-issuance/issuance-validators';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { LearCredentialIssuancePayload, RawCredentialPayload } from 'src/app/core/models/dto/lear-credential-issuance-request.dto';
import { IssuanceRequestFactoryService } from './issuance-request-factory.service';
import { LearCredentialIssuanceRequestDto } from 'src/app/core/models/dto/procedure-request-two-dto';
import { AuthService } from 'src/app/core/services/auth.service';
import { map, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CredentialIssuanceTwoService {

  private readonly authService = inject(AuthService);
  private readonly credentialFactory = inject(IssuanceRequestFactoryService);
  private readonly countryService = inject(CountryService);
  private readonly credentialService = inject(CredentialProcedureService);

  constructor() { }


  submitCredential(
    credentialData: RawCredentialPayload, 
    credentialType: CredentialType,
  ): void{
   
    const payload: LearCredentialIssuancePayload = this.credentialFactory.createCredentialRequest(credentialData, credentialType);
    const request: LearCredentialIssuanceRequestDto = this.buildRequestDto(credentialType, payload);
    this.sendCredential(request);
  }

  buildRequestDto(credType:CredentialType, payload:LearCredentialIssuancePayload): LearCredentialIssuanceRequestDto{
    return {
      schema: credType,
      format: "jwt_vc_json",
      payload: payload,
      operation_mode: "S"
    }
  }

  getPayloadKeysFromCredentialSchema(credSchema: CredentialIssuanceFormSchema): string[]{
    return Object.keys(credSchema);
  }

  sendCredential(credentialPayload: LearCredentialIssuanceRequestDto){
    // this.credentialService.createProcedure(credentialPayload);
    console.log('SEND CREDENTIAL: ');
    console.log(credentialPayload);
    this.credentialService.createProcedureTwo(credentialPayload);
  }

  getValidatorFn(entry: ValidatorEntry): ValidatorFn | null {
    const factory = ALL_VALIDATORS_FACTORY_MAP[entry.name];
    return factory ? factory(...(entry.args ?? [])) : null;
}

  issuanceFormBuilder(schema: CredentialIssuanceFormSchema, asSigner:boolean): FormGroup {
    const group: Record<string, any> = {};

    for (const [key, field] of Object.entries(schema)) {
      if(!asSigner && field.display === 'pref_side'){ continue; }

      if (field.type === 'control') {
        const validators = field.validators?.map(this.getValidatorFn).filter(Boolean) as ValidatorFn[];
        group[key] = new FormControl('', validators);
      } else if (field.type === 'group' && field.groupFields) {
        group[key] = this.issuanceFormBuilder(field.groupFields, asSigner);
      } else {
        console.warn(`Unknown or invalid field type for key "${key}"`);
      }
    }

    return new FormGroup(group);
  }

  getShemasFromCredentialType(credType: CredentialType):[CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema]{
    //todo
    if(credType === 'LEARCredentialEmployee'){
      const countries = this.countryService.getCountriesAsSelectorOptions();
      return getLearCredentialEmployeeIssuanceFormSchemas(countries);
    }else if(credType === 'LEARCredentialMachine'){
      const countries = this.countryService.getCountriesAsSelectorOptions();
      return getLearCredentialMachineIssuanceFormSchemas(countries);
      //todo
    }else if(credType === 'VerifiableCertification'){
      return [] as any;
    }else{
      throw new Error(`Unknown credential type: ${credType}`);
    }
  }

  getFormSchemaFromCredentialType(credType: CredentialType): CredentialIssuanceFormSchema{
    return this.getShemasFromCredentialType(credType)[0];
  }

  getPowersSchemaFromCredentialType(credType: CredentialType): CredentialIssuancePowerFormSchema{
    return this.getShemasFromCredentialType(credType)[1];
  }

  public getRawMandator(): {mandator: EmployeeMandator} | null{
    const mandator = this.authService.getRawMandator();
    return mandator ? { mandator } : null;
  }

}
