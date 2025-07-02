import { inject, Injectable, InjectionToken } from "@angular/core";
import { CredentialIssuanceFormSchema, CredentialIssuancePowerFormSchema, CredentialIssuanceSchemaBuilder, IssuanceCredentialType } from "src/app/core/models/entity/lear-credential-issuance";
import { IssuanceStaticDataSchema } from "../../components/credential-issuance/credential-issuance.component";

export const CREDENTIAL_SCHEMA_BUILDERS = new InjectionToken<CredentialIssuanceSchemaBuilder[]>('CREDENTIAL_SCHEMA_BUILDERS');

@Injectable({ providedIn: 'root' })
export class IssuanceSchemaBuilder {
    private readonly builders: CredentialIssuanceSchemaBuilder[] = inject(CREDENTIAL_SCHEMA_BUILDERS);


  public getIssuanceFormSchema(type: IssuanceCredentialType): CredentialIssuanceFormSchema{
    return this.getBuilder(type).getSchema()[0];
  }

  public getIssuancePowerFormSchema(type: IssuanceCredentialType): CredentialIssuancePowerFormSchema{
    return this.getBuilder(type).getSchema()[1];
  }

  public schemasBuilder(
    credType: IssuanceCredentialType,
    asSigner: boolean
  ): [CredentialIssuanceFormSchema, IssuanceStaticDataSchema] {
    const rawSchema = this.getIssuanceFormSchema(credType);
  
    const formSchema: CredentialIssuanceFormSchema = [];
    const staticSchema: IssuanceStaticDataSchema = {};
  
    for (const field of rawSchema) {
      const display = field.display;
      if(display === 'side'){
        if (typeof field.staticValueGetter === 'function') {
          const val = field.staticValueGetter();
          if (val && typeof val === 'object') {
            Object.assign(staticSchema, val);
          }else{
            console.warn('Could not get value from field ' + field);
          }
        }
      }
      if (display === 'pref_side') {
        if (!asSigner && typeof field.staticValueGetter === 'function') {
          const val = field.staticValueGetter();
          if (val && typeof val === 'object') {
            Object.assign(staticSchema, val);
          }else{
            console.warn('Could not get value from field ' + field);
          }
          continue;
        }
      }
  
      formSchema.push(field);
    }
  
    return [formSchema, staticSchema];
  }

  private getBuilder(type: IssuanceCredentialType): CredentialIssuanceSchemaBuilder {
    const b = this.builders.find(x => (x as any).credType === type);
    if(!b) throw new Error(`No schema builder for ${type}`);
    return b;
  }


}
