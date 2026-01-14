import { CredentialProceduresResponse } from "../models/dto/credential-procedures-response.dto";

export const credentialProceduresResponseMock: CredentialProceduresResponse = {
  credential_procedures: [
    {
      credential_procedure: {
        procedure_id: 'proc-001',
        subject: 'John Doe',
        credential_type: "LEAR_CREDENTIAL_EMPLOYEE",
        status: "VALID",
        updated: '2025-01-10T09:30:00Z',
        email: 'john.doe@example.com',
        organization_identifier: 'ORG-123'
      }
    },
    {
      credential_procedure: {
        procedure_id: 'proc-002',
        subject: 'Jane Smith',
        credential_type: "LEAR_CREDENTIAL_EMPLOYEE",
        status: "PEND_DOWNLOAD",
        updated: '2025-01-09T15:12:00Z',
        email: 'jane.smith@example.com',
        organization_identifier: 'ORG-456'
      }
    }
  ]
};
