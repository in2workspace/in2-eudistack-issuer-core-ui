import { ExtendedValidatorFn } from '../../../shared/validators/credential-issuance/all-validators';
import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ALL_VALIDATORS_FACTORY_MAP, ValidatorEntry } from 'src/app/shared/validators/credential-issuance/all-validators';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { IssuanceLEARCredentialPayload, IssuanceRawCredentialPayload, IssuanceLEARCredentialRequestDto } from 'src/app/core/models/dto/lear-credential-issuance-request.dto';
import { IssuanceRequestFactoryService } from './issuance-request-factory.service';
import { Observable } from 'rxjs';
import { IssuanceSchemaBuilder } from './issuance-schema-builders/issuance-schema-builder';
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema, IssuanceCredentialType } from 'src/app/core/models/entity/lear-credential-issuance';


@Injectable({
  providedIn: 'root'
})
export class CredentialIssuanceService {

  private readonly credentialFactory = inject(IssuanceRequestFactoryService);
  private readonly credentialService = inject(CredentialProcedureService);
  private readonly schemaBuilder = inject(IssuanceSchemaBuilder);


  public schemasBuilder(credType: "LEARCredentialEmployee" | "LEARCredentialMachine", asSigner: boolean){
    return this.schemaBuilder.schemasBuilder(credType, asSigner);
  }

  public getPowersSchemaFromCredentialType(credType: IssuanceCredentialType): CredentialIssuancePowerFormSchema{
    return this.schemaBuilder.getIssuancePowerFormSchema(credType);
  }

  public formBuilder(schema: CredentialIssuanceFormSchema, asSigner: boolean): FormGroup {
    const group: Record<string, any> = {};

    for (const field of schema) {
      const { key, type, display, groupFields } = field;
      if(!asSigner && (display === 'pref_side' || display === 'side')){ continue; }

      if (type === 'control') {
        const validators = field.validators?.map(this.getValidatorFn).filter(Boolean) as ExtendedValidatorFn[];
        group[key] = new FormControl('', validators);
      } else if (type === 'group' && groupFields) {
        group[key] = this.formBuilder(groupFields, asSigner);
      } else {
        console.warn(`Unknown or invalid field type for key "${key}"`);
      }
    }

    return new FormGroup(group);
  }

  
  public submitCredential(
    credentialData: IssuanceRawCredentialPayload, 
    credentialType: IssuanceCredentialType,
  ): Observable<void>{
   
    const payload: IssuanceLEARCredentialPayload = this.buildRequestPayload(credentialData, credentialType);
    const request: IssuanceLEARCredentialRequestDto = this.buildRequestDto(credentialType, payload);
    return this.sendCredential(request);
  }


  private getValidatorFn(entry: ValidatorEntry): ExtendedValidatorFn | null {
    const factory = ALL_VALIDATORS_FACTORY_MAP[entry.name];
    return factory ? factory(...(entry.args ?? [])) : null;
  }

  private buildRequestPayload(credentialData: IssuanceRawCredentialPayload, credentialType: IssuanceCredentialType): IssuanceLEARCredentialPayload{
    return this.credentialFactory.createCredentialRequest(credentialData, credentialType);
  }

  private buildRequestDto(credType:IssuanceCredentialType, payload: IssuanceLEARCredentialPayload): IssuanceLEARCredentialRequestDto{
    return {
      schema: credType,
      format: "jwt_vc_json",
      payload: payload,
      operation_mode: "S"
    }
  }

  private sendCredential(credentialPayload: IssuanceLEARCredentialRequestDto): Observable<void>{
    console.log('SEND CREDENTIAL: ');
    console.log(credentialPayload);
    return this.credentialService.createProcedure(credentialPayload);
  }

}
