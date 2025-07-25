import { inject, Injectable, InjectionToken } from "@angular/core";
import { CredentialIssuanceTypedViewModelSchema, CredentialIssuanceSchemaProvider, IssuanceCredentialType, IssuanceStaticViewModel, CredentialIssuanceViewModelField, CredentialIssuanceViewModelSchema, IssuanceViewModelsTuple, CredentialIssuanceViewModelGroupField, CredentialIssuanceViewModelSchemaWithId, CredentialIssuanceViewModelGroupFieldWithId } from "src/app/core/models/entity/lear-credential-issuance";

export const CREDENTIAL_SCHEMA_PROVIDERS = new InjectionToken<CredentialIssuanceSchemaProvider<IssuanceCredentialType>[]>('CREDENTIAL_SCHEMA_PROVIDERS');

@Injectable({ providedIn: 'root' })
export class IssuanceSchemaBuilder {
    private readonly schemaProviders: CredentialIssuanceSchemaProvider<IssuanceCredentialType>[] = inject(CREDENTIAL_SCHEMA_PROVIDERS);


  public getIssuanceFormSchema<T extends IssuanceCredentialType>(type: T): CredentialIssuanceTypedViewModelSchema<T>{
    return this.getBuilder(type).getSchema();
  }

  public formSchemasBuilder<T extends IssuanceCredentialType>(
    credType: T,
    asSigner: boolean
  ): IssuanceViewModelsTuple {
    const rawSchema: CredentialIssuanceViewModelSchema  = this.getIssuanceFormSchema(credType).schema;
    const formViewModel: CredentialIssuanceViewModelSchemaWithId = [];
    const staticSchema: IssuanceStaticViewModel = {};

    for (const field of rawSchema) {
      // id is added to enable the "track" function in the fields @for loop
      // we add NOSONAR since this id is sufficient for the number of fields we manage + the id is not sent to backend
      const fieldWithId: CredentialIssuanceViewModelGroupFieldWithId = { ...field, id: Math.random() * 1000 }; // NOSONAR

      if (this.shouldExtractStatic(fieldWithId, asSigner)) {
        this.extractStatic(fieldWithId, staticSchema);
        continue;
      }

      formViewModel.push(fieldWithId);
    }

    return [formViewModel, staticSchema];
  }

  private shouldExtractStatic(field: CredentialIssuanceViewModelGroupField, asSigner: boolean): boolean {
    if (field.display === 'side') return true;
    if (field.display === 'pref_side' && !asSigner) return true;
    return false;
  }

  private extractStatic(field: CredentialIssuanceViewModelField, staticSchema: IssuanceStaticViewModel): void {
    const getter = field.staticValueGetter;
    if (typeof getter === 'function') {
      const val = getter();
      if (val && typeof val === 'object') {
        Object.assign(staticSchema, val);
      } else {
        console.warn(`Could not get static value from field ${field.key ?? field}`);
      }
    }
}

  private getBuilder<T extends IssuanceCredentialType>(type: T): CredentialIssuanceSchemaProvider<T> {
    const b = this.schemaProviders.find(x => x.getSchema().type === type) as CredentialIssuanceSchemaProvider<T> | undefined;
    if(!b) throw new Error(`No schema builder for ${type}`);
    return b;
  }


}
