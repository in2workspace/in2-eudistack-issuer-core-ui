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
      if (this.shouldExtractStatic(field, asSigner)) {
        this.extractStatic(field, staticSchema);
        continue;
      }

      formSchema.push(field);
    }

    return [formSchema, staticSchema];
  }

  private shouldExtractStatic(field: any, asSigner: boolean): boolean {
    if (field.display === 'side') return true;
    if (field.display === 'pref_side' && !asSigner) return true;
    return false;
  }

  private extractStatic(field: any, staticSchema: IssuanceStaticDataSchema): void {
    const getter = field.staticValueGetter;
    if (typeof getter === 'function') {
      const val = getter();
      if (val && typeof val === 'object') {
        Object.assign(staticSchema, val);
      } else {
        console.warn(`Could not get static value from field ${field.name || field}`);
      }
    }
}

  private getBuilder(type: IssuanceCredentialType): CredentialIssuanceSchemaBuilder {
    const b = this.builders.find(x => (x as any).credType === type);
    if(!b) throw new Error(`No schema builder for ${type}`);
    return b;
  }


}
