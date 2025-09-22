import { TestBed } from '@angular/core/testing';
import { IssuanceRequestFactoryService } from './issuance-request-factory.service';
import {
  IssuanceLEARCredentialEmployeePayload,
  IssuanceLEARCredentialMachinePayload
} from '../../../core/models/dto/lear-credential-issuance-request.dto';
import { IssuanceRawCredentialPayload, IssuanceRawPowerForm } from 'src/app/core/models/entity/lear-credential-issuance';

describe('IssuanceRequestFactoryService', () => {
  let service: IssuanceRequestFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IssuanceRequestFactoryService]
    });
    service = TestBed.inject(IssuanceRequestFactoryService);

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw TypeError for unknown credential type', () => {
    const payload = {
      asSigner: false,
      optional: { staticData: { mandator: {} } },
      formData: { mandatee: {} }
    } as unknown as IssuanceRawCredentialPayload;

    expect(() => service.createCredentialRequest(payload, 'UNKNOWN' as any))
      .toThrow(TypeError);
  });

  //todo test
  //  it('should create employee request with fallback commonName and VAT prefix', () => {
  //   const credentialData: any = {
  //     asSigner: true,
  //     formData: {
  //       power: { Onboarding: { Execute: true } },
  //       mandator: {
  //         emailAddress: 'alice@example.com',
  //         organization: 'ACME Corp',
  //         country: 'ES',
  //         firstName: 'Alice',
  //         lastName: 'Smith',
  //         serialNumber: 'SN123',
  //         organizationIdentifier: '12345'
  //       },
  //       mandatee: { id: 'M1', domain: 'example.com' }
  //     }
  //   };

  //   const result = service.createCredentialRequest(credentialData, 'LEARCredentialEmployee');
  //   const emp = result as IssuanceLEARCredentialEmployeePayload;

  //   expect(emp).toEqual({
  //     mandator: {
  //       emailAddress: 'alice@example.com',
  //       organization: 'ACME Corp',
  //       country: 'ES',
  //       commonName: 'Alice Smith',
  //       serialNumber: 'SN123',
  //       organizationIdentifier: 'VATES-12345'
  //     },
  //     mandatee: { id: 'M1', domain: 'example.com' },
  //     power: [
  //       {
  //         type: 'domain',
  //         domain: 'DOME',
  //         function: 'Onboarding',
  //         action: ['Execute']
  //       }
  //     ]
  //   });
  // });

  it('should use provided commonName and keep VAT prefix for employee', () => {
    const credentialData: any = {
      asSigner: true,
      formData: {
        power: { Onboarding: { Execute: true } },
        mandator: {
          emailAddress: 'bob@example.com',
          organization: 'Beta Ltd',
          country: 'FR',
          commonName: 'Beta Common',
          serialNumber: 'SN555',
          organizationIdentifier: 'VATFR-999'
        },
        mandatee: { id: 'M2', domain: 'beta.com' }
      }
    };

    const result = service.createCredentialRequest(credentialData, 'LEARCredentialEmployee');
    const emp = result as IssuanceLEARCredentialEmployeePayload;

    expect(emp.mandator.commonName).toBe('Beta Common');
    expect(emp.mandator.organizationIdentifier).toBe('VATFR-999');
  });

  it('should create machine request with did and mandatee fields', () => {
    const credentialData: any = {
      asSigner: true,
      formData: {
        power: { Onboarding: { Execute: true } },
        mandator: {
          firstName: 'Eve',
          lastName: 'Doe',
          organization: 'Tech Corp',
          country: 'ES',
          organizationIdentifier: '246',
          serialNumber: 'S246'
        },
        mandatee: { domain: 'example.com', ipAddress: '127.0.0.1' },
        keys: { didKey: 'did:desmos:abc' }
      }
    };

    const result = service.createCredentialRequest(credentialData, 'LEARCredentialMachine');
    const mach = result as IssuanceLEARCredentialMachinePayload;

    expect(mach).toEqual({
      mandator: {
        commonName: 'Eve Doe',
        serialNumber: 'S246',
        organization: 'Tech Corp',
        organizationIdentifier: 'VATES-246',
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

  it('should use provided commonName and keep VAT prefix for machine', () => {
    const credentialData: any = {
      asSigner: true,
      formData: {
        power: { Onboarding: { Execute: true } },
        mandator: {
          commonName: 'MachineCo',
          organization: 'Org',
          country: 'DE',
          organizationIdentifier: 'VATDE-555',
          serialNumber: 'SN555'
        },
        mandatee: { domain: 'machine.com', ipAddress: '1.2.3.4' },
        keys: { didKey: 'did:test' }
      }
    };

    const result = service.createCredentialRequest(credentialData, 'LEARCredentialMachine');
    const mach = result as IssuanceLEARCredentialMachinePayload;

    expect(mach.mandator.commonName).toBe('MachineCo');
    expect(mach.mandator.id).toBe('did:elsi:VATDE-555');
    expect(mach.mandatee.id).toBe('did:test');
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

  it('should return empty array when power form is empty', () => {
    const parsed = (service as any).parsePower({}, 'LEARCredentialEmployee');
    expect(parsed).toEqual([]);
  });

  it('should parse multiple powers correctly', () => {
    const powerForm: IssuanceRawPowerForm = {
      Onboarding: { Execute: true },
      ProductOffering: { Create: true, Update: true, Upload: false }
    } as any;

    const parsed = (service as any).parsePower(powerForm, 'LEARCredentialEmployee');

    expect(parsed).toEqual([
      {
        type: 'domain',
        domain: 'DOME',
        function: 'Onboarding',
        action: ['Execute']
      },
      {
        type: 'domain',
        domain: 'DOME',
        function: 'ProductOffering',
        action: ['Create', 'Update']
      }
    ]);
  });
});
