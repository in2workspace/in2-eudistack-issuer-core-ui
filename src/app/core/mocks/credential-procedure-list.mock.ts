import { CredentialProcedure } from "../models/dto/procedure-response.dto";

export const credentialProcedureListMock: CredentialProcedure[] =[
    {
        credential_procedure: {
            procedure_id: "aaa",
            subject: "AAAAAAAAAAAAA BBBBBBB",
            status: "ISSUED",
            credential_type: "LEARCredentialEmployee",
            updated: "2024-11-25T14:35:45.123+01:00"
        }
    },
    {
        credential_procedure: {
            procedure_id: "aaa",
            subject: "ddddddddd CCCCCCCCCCCCCcc",
            status: "PEND_DOWNLOAD",
            credential_type: "VerifiableCertification",
            updated: "2024-11-26T14:35:45.123+01:00"
        }
    },
    {
        credential_procedure: {
            procedure_id: "aaa",
            subject: "aaaaaaaaaaaaaaa CCCCCCCCCCCCCcc",
            status: "WITHDRAWN",
            credential_type: "VerifiableCertification",
            updated: "2024-11-26T14:35:45.123+01:00"
        }
    },
    {
        credential_procedure: {
            procedure_id: "aaa",
            subject: "ddddddddddddddd hhhhhhhhhhhhh",
            status: "EXPIRED",
            credential_type: "VerifiableCertification",
            updated: "2024-11-26T14:35:45.123+01:00"
        }
    },
    {
        credential_procedure: {
            procedure_id: "aaa",
            subject: "xxxxxxxxxxxxxxxxxx zzzzzzzzzzzzzzzz",
            status: "VALID",
            credential_type: "VerifiableCertification",
            updated: "2024-11-26T14:35:45.123+01:00"
        }
    },
    {
        credential_procedure: {
            procedure_id: "aaa",
            subject: "hhhhhhhhhhh jjjjjjjjjjjjjjjjjj",
            status: "DRAFT",
            credential_type: "VerifiableCertification",
            updated: "2024-11-26T14:35:45.123+01:00"
        }
    },
]
