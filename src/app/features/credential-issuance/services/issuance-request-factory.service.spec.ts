import { TestBed } from '@angular/core/testing';
import { IssuanceRequestFactoryService } from './issuance-request-factory.service';
import {
  IssuanceRawCredentialPayload,
} from '../../../core/models/dto/lear-credential-issuance-request.dto';
import { IssuanceRawPowerForm } from 'src/app/core/models/entity/lear-credential-issuance';

describe('IssuanceRequestFactoryService', () => {
  let service: IssuanceRequestFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IssuanceRequestFactoryService]
    });
    service = TestBed.inject(IssuanceRequestFactoryService);

    // Espiar console.error i console.log per silenciar i verificar crides
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty payload for unknown credential type', () => {
    const payload = {
      power: {},
      asSigner: false,
      optional: { staticData: { mandator: {} } },
      partialCredentialSubject: { mandatee: {} }
    } as unknown as IssuanceRawCredentialPayload;

    const result = service.createCredentialRequest(payload, 'UNKNOWN' as any);
    expect(console.error).toHaveBeenCalledWith('Unexpected credential type');
    expect(result).toEqual({} as any);
  });

  it('should create employee request with fallback commonName and VAT prefix', () => {
    const credentialData: any = {
      power: { Onboarding: { Execute: true } },
      asSigner: true,
      partialCredentialSubject: {
        mandator: {
          emailAddress: 'alice@example.com',
          organization: 'ACME Corp',
          country: 'ES',
          firstName: 'Alice',
          lastName: 'Smith',
          serialNumber: 'SN123',
          organizationIdentifier: '12345'
        },
        mandatee: { id: 'M1', domain: 'example.com' }
      }
    };

    const result = service.createCredentialRequest(credentialData, 'LEARCredentialEmployee');

    expect(result).toEqual({
      mandator: {
        emailAddress: 'alice@example.com',
        organization: 'ACME Corp',
        country: 'ES',
        commonName: 'Alice Smith',
        serialNumber: 'SN123',
        organizationIdentifier: 'VATES-12345'
      },
      mandatee: { id: 'M1', domain: 'example.com' },
      power: [
        {
          type: 'domain',
          domain: 'DOME',
          function: 'Onboarding',
          action: ['Execute']
        }
      ]
    });
  });

 

  it('should create machine request with did and mandatee fields', () => {
    const credentialData: any = {
      power: { Onboarding: { Execute: true } },
      asSigner: true,
      partialCredentialSubject: {
        mandator: {
          firstName: 'Eve',
          lastName: 'Doe',
          organization: 'Tech Corp',
          country: 'ES',
          organizationIdentifier: 'VATES-246',
          serialNumber: 'S246'
        },
        mandatee: { domain: 'example.com', ipAddress: '127.0.0.1' }
      },
      optional: {
        keys: { desmosDidKeyValue: 'did:desmos:abc' }
      }
    };

    const result = service.createCredentialRequest(credentialData, 'LEARCredentialMachine');

    expect(result).toEqual({
      mandator: {
        commonName: 'Eve Doe',
        serialNumber: 'S246',
        organization: 'Tech Corp',
        id: 'did:elsi:VATES-246',
        country: 'ES'
      },
      mandatee: {
        id: 'did:desmos:abc',
        domain: 'example.com',
        ipAddress: '127.0.0.1'
      },
      power: [
        {
          type: 'domain',
          domain: 'DOME',
          function: 'Onboarding',
          action: ['Execute']
        }
      ]
    });
  });

  it('should parse power errors for unknown base and no actions', () => {
    const powerForm: IssuanceRawPowerForm = {
      UnknownFunc: { Foo: true },
      Onboarding: { Execute: false }
    } as any;

    const parsed = (service as any).parsePower(powerForm, 'LEARCredentialEmployee');

    expect(parsed).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      'Function key found in schema but not in received data: UnknownFunc'
    );
    expect(console.error).toHaveBeenCalledWith(
      'Not actions found for this key: Onboarding'
    );
  });
});
