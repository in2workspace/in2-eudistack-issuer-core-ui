import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { CredentialType, EmployeeMandator } from 'src/app/core/models/entity/lear-credential';
import { CountryService } from 'src/app/shared/components/form-credential/services/country.service';
import { ALL_VALIDATORS_FACTORY_MAP, ValidatorEntry } from 'src/app/shared/validators/credential-issuance/issuance-validators';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { LearCredentialIssuancePayload, RawCredentialPayload } from 'src/app/core/models/dto/lear-credential-issuance-request.dto';
import { IssuanceRequestFactoryService } from './issuance-request-factory.service';
import { LearCredentialIssuanceRequestDto } from 'src/app/core/models/dto/procedure-request-two-dto';
import { AuthService } from 'src/app/core/services/auth.service';
import { Observable } from 'rxjs';
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema, CredentialIssuanceSchemaTuple, getLearCredentialEmployeeIssuanceFormSchemas, getLearCredentialMachineIssuanceFormSchemas } from 'src/app/core/models/schemas/lear-credential-issuance-schemas';
import { StaticSchema } from '../components/credential-issuance-two/credential-issuance-two.component';


@Injectable({
  providedIn: 'root'
})
export class CredentialIssuanceTwoService {

  private readonly authService = inject(AuthService);
  private readonly credentialFactory = inject(IssuanceRequestFactoryService);
  private readonly countryService = inject(CountryService);
  private readonly credentialService = inject(CredentialProcedureService);
  
  /* BUILD FORM LOGIC */
  private schemaMap: Record<CredentialType, () => CredentialIssuanceSchemaTuple> = {
      LEARCredentialEmployee: () =>
        getLearCredentialEmployeeIssuanceFormSchemas(
          this.countryService.getCountriesAsSelectorOptions()
        ),
      LEARCredentialMachine: () =>
        getLearCredentialMachineIssuanceFormSchemas(
          this.countryService.getCountriesAsSelectorOptions()
        ),
        // todo remove
      VerifiableCertification: () => [] as any,
    };

  private getValidatorFn(entry: ValidatorEntry): ValidatorFn | null {
    const factory = ALL_VALIDATORS_FACTORY_MAP[entry.name];
    return factory ? factory(...(entry.args ?? [])) : null;
}

  public schemasBuilder(credType:CredentialType, asSigner:boolean): [CredentialIssuanceFormSchema, StaticSchema]{
    const rawSchema = this.getFormSchemaFromCredentialType(credType);
    const formSchema = [] as CredentialIssuanceFormSchema;
    let staticSchema = {} as StaticSchema;
    for(const field of rawSchema){
      const { display } = field;
      if(!asSigner && display === 'pref_side'){ 
        if(credType === 'LEARCredentialEmployee' || credType === 'LEARCredentialMachine'){
          // const mandator = this.getMandatorFromAuth();
          // todo restore
          const mandator = {
            mandator:{
              organizationIdentifier: 'ORG123',
              organization: 'Test Org',
              commonName: 'Some Name',
              emailAddress: 'some@example.com',
              serialNumber: '123',
              country: 'SomeCountry'
            }
          }
          if(!mandator){
            console.error("Couldn't get mandator.");
          }else{
            staticSchema = { ...mandator };
          }
        }else{
          console.error('Static data found in unexpected credential type: ' + credType);
        }
        continue; }
      formSchema.push(field);
    }
    return [formSchema, staticSchema];
  }

  public formBuilder(schema: CredentialIssuanceFormSchema, asSigner: boolean): FormGroup {
    const group: Record<string, any> = {};

    for (const field of schema) {
      const { key, type, display, groupFields } = field;
      if(!asSigner && display === 'pref_side'){ continue; }

      if (type === 'control') {
        const validators = field.validators?.map(this.getValidatorFn).filter(Boolean) as ValidatorFn[];
        group[key] = new FormControl('', validators);
      } else if (type === 'group' && groupFields) {
        group[key] = this.formBuilder(groupFields, asSigner);
      } else {
        console.warn(`Unknown or invalid field type for key "${key}"`);
      }
    }

    return new FormGroup(group);
  }

  getSchemasFromCredentialType(credType: CredentialType): CredentialIssuanceSchemaTuple {
    return this.schemaMap[credType]();
  }

  private getFormSchemaFromCredentialType(credType: CredentialType): CredentialIssuanceFormSchema{
    return this.getSchemasFromCredentialType(credType)[0];
  }

  getPowersSchemaFromCredentialType(credType: CredentialType): CredentialIssuancePowerFormSchema{
    return this.getSchemasFromCredentialType(credType)[1];
  }

  public getMandatorFromAuth(): { mandator: EmployeeMandator } | null{
    const mandator = this.authService.getRawMandator();
    return mandator ? { mandator } : null;
  }

  /* SUBMISSION LOGIC */
  public submitCredential(
    credentialData: RawCredentialPayload, 
    credentialType: CredentialType,
  ): Observable<void>{
   
    const payload: LearCredentialIssuancePayload = this.buildRequestPayload(credentialData, credentialType);
    const request: LearCredentialIssuanceRequestDto = this.buildRequestDto(credentialType, payload);
    return this.sendCredential(request);
  }

  private buildRequestPayload(credentialData: RawCredentialPayload, credentialType: CredentialType): LearCredentialIssuancePayload{
    return this.credentialFactory.createCredentialRequest(credentialData, credentialType);
  }

  private buildRequestDto(credType:CredentialType, payload:LearCredentialIssuancePayload): LearCredentialIssuanceRequestDto{
    return {
      schema: credType,
      format: "jwt_vc_json",
      payload: payload,
      operation_mode: "S"
    }
  }

  private sendCredential(credentialPayload: LearCredentialIssuanceRequestDto): Observable<void>{
    console.log('SEND CREDENTIAL: ');
    console.log(credentialPayload);
    return this.credentialService.createProcedureTwo(credentialPayload);
  }

}
