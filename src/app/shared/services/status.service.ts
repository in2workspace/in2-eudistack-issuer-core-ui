import { Injectable } from '@angular/core';
import { CredentialProcedure } from 'src/app/core/models/dto/procedure-response.dto';
import { CredentialStatus } from 'src/app/core/models/entity/lear-credential';
import { CredentialProcedureWithClass, StatusClass, DefinedStatusClass, StatusClassFromDefined, STATUSES_WITH_DEFINED_CLASS } from 'src/app/core/models/entity/lear-credential-management';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private readonly statusesWithDefinedClass = STATUSES_WITH_DEFINED_CLASS;

  constructor() { }

    public addStatusClass(credentialProcedure: CredentialProcedure[]): CredentialProcedureWithClass[]{
      const procedureWithStatus: CredentialProcedureWithClass[] = credentialProcedure.map(cred => {
        const credStatus: string = this.mapStatusToClass(cred.credential_procedure.status);
        return { ...cred, statusClass: credStatus };
      
      });
      return procedureWithStatus;
    }
  
    public mapStatusToClass(status: CredentialStatus): StatusClass{
      if (this.statusesWithDefinedClass.includes(status as DefinedStatusClass)) {
        const slug = status.toLowerCase().replace(/_/g, '-'); //for statuses like "PEND_DOWNLOAD"
        return `status-${slug}` as StatusClassFromDefined;
      }
      return 'status-default';
    }
}
