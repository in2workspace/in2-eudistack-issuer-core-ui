import { TestBed } from '@angular/core/testing';
import { finalize, of, Subject, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { UserDataAuthenticationResponse } from '../models/dto/user-data-authentication-response.dto';
import { CredentialStatus, LEARCredentialEmployee } from '../models/entity/lear-credential';
import { RoleType } from '../models/enums/auth-rol-type.enum';
import { LEARCredentialDataNormalizer } from '../models/entity/lear-credential-employee-data-normalizer';

/**
 * A few mock objects to reduce repetition.
 * Adjust as needed for your real data shape.
 */
const mockCredentialEmployee: LEARCredentialEmployee = {
  id: 'some-id',
  type: ['VerifiableCredential', 'LEARCredentialEmployee'],
  description: 'Test credential',
  credentialStatus: {} as CredentialStatus,
  credentialSubject: {
    mandate: {
      id: 'mandate-id',
      life_span: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-12-31T23:59:59Z'
      },
      signer: {
        organizationIdentifier: 'SIGNER123',
        organization: 'Signer Organization',
        commonName: 'Signer Name',
        emailAddress: 'signer@example.com',
        serialNumber: '7891011',
        country: 'Signerland'
      },
      mandator: {
        organizationIdentifier: 'ORG123',
        organization: 'Test Organization',
        commonName: 'Mandator Name',
        emailAddress: 'mandator@example.com',
        serialNumber: '123456',
        country: 'Testland'
      },
      mandatee: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'jhonDoe@example.com',
        nationality: ''
      },
      power: [
        {
          function: 'Onboarding',
          action: 'Execute',
          domain: 'domain',
          type: 'type'
        }
      ]
    }
  },
  issuer: {
    organizationIdentifier: 'ORG123',
    organization: 'Test Organization',
    commonName: 'Mandator Name',
    emailAddress: 'mandator@example.com',
    serialNumber: '123456',
    country: 'Testland'
  },
  validFrom: '2024-01-01T00:00:00Z',
  validUntil: '2024-12-31T23:59:59Z',
  issuanceDate: '2024-01-01T00:00:00Z',
  expirationDate: '2024-12-31T23:59:59Z'
};



const mockUserDataWithVC: UserDataAuthenticationResponse = {
  sub: 'subValue',
  commonName: 'commonNameValue',
  country: 'countryValue',
  serialNumber: 'serialNumberValue',
  email_verified: true,
  preferred_username: 'preferred_usernameValue',
  given_name: 'givenNameValue',
  vc: mockCredentialEmployee, 
  'tenant-id': 'tenant-idValue',
  emailAddress: 'someone@example.com',
  organizationIdentifier: 'ORG123',
  organization: 'Test Organization',
  name: 'John Doe',
  family_name: 'Doe',
  role: RoleType.LEAR
};

const mockUserDataWithCert: UserDataAuthenticationResponse = {
  sub: 'subCert',
  commonName: 'Cert Common Name',
  country: 'CertLand',
  serial_number: '99999999',
  serialNumber: '99999999',
  email_verified: true,
  preferred_username: 'certUser',
  given_name: 'CertGivenName',
  'tenant-id': 'tenant-123',
  email:'cert-user@example.com',
  emailAddress: 'cert-user@example.com',
  organizationIdentifier: 'ORG-CERT',
  organization: 'Cert Organization',
  name: 'John Cert',
  family_name: 'Cert',
  // Propiedad 'cert' (de tipo EIDASCertificate) está definida opcionalmente.
  role: RoleType.LEAR
};

const mockUserDataNoVCNoCert: UserDataAuthenticationResponse = {
  sub: 'subCert',
  commonName: 'Cert Common Name',
  country: 'CertLand',
  serialNumber: '99999999',
  email_verified: true,
  preferred_username: 'certUser',
  given_name: 'CertGivenName',
  'tenant-id': 'tenant-123',
  emailAddress: 'cert-user@example.com',
  organizationIdentifier: 'ORG-CERT',
  organization: 'Cert Organization',
  name: 'John Cert',
  family_name: 'Cert',
};

describe('AuthService', () => {
  let service: AuthService;
  let mockPublicEventsService: jest.Mocked<any>;
  let broadcastMessages: any[] = [];

  // We'll mock OidcSecurityService and any direct dependencies (like normalizer).
  let oidcSecurityServiceMock: {
    checkAuth: jest.Mock,
    logoff: jest.Mock,
    authorize: jest.Mock,
    logoffAndRevokeTokens: jest.Mock
  };

  let extractVcSpy: jest.SpyInstance; 
 
    class BroadcastChannelMock {
    name: string;
    onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null = null;
    constructor(name: string) {
      this.name = name;
      broadcastMessages = [];
    }
    postMessage(message: any) {
      broadcastMessages.push(message);
    }
    close() {}
  }

  beforeAll(() => {
    // Global mock del BroadcastChannel
    (globalThis as any).BroadcastChannel = BroadcastChannelMock;
  });

  beforeEach(() => {
    oidcSecurityServiceMock = {
      checkAuth: jest.fn().mockReturnValue(of({ 
        isAuthenticated: false,
        userData: null,
        accessToken: null 
      })),
      authorize: jest.fn(),
      logoffAndRevokeTokens: jest.fn(),
      logoff: jest.fn().mockReturnValue(of()),
    };
        mockPublicEventsService = {
      registerForEvents: jest.fn().mockReturnValue(of())
    }
    jest.spyOn(LEARCredentialDataNormalizer.prototype, 'normalizeLearCredential')
    .mockImplementation((data) => data);

    
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
        {
          provide: PublicEventsService,
          useValue: mockPublicEventsService
        }
      ]
    });

    service = TestBed.inject(AuthService);

    extractVcSpy = jest.spyOn(service as any, 'extractVCFromUserData');

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        clear: jest.fn()
      },
      writable: true
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------------
  // Basic creation / login / logout
  // ----------------------------------------------------------------------------
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call authorize on OidcSecurityService when login() is called', () => {
    service.login();
    expect(oidcSecurityServiceMock.authorize).toHaveBeenCalled();
  });

  it('should call logoffAndRevokeTokens when logout() is called', () => {
    service.logout();
    expect(oidcSecurityServiceMock.logoffAndRevokeTokens).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------------------
  // Observables: isLoggedIn, getUserData, getEmailName, getToken, getName, etc.
  // ----------------------------------------------------------------------------
  it('should return false initially for isLoggedIn()', done => {
    service.isLoggedIn().subscribe(isLoggedIn => {
      expect(isLoggedIn).toBe(false);
      done();
    });
  });

  it('should return null for getUserData() initially', done => {
    service.getUserData().subscribe(userData => {
      expect(userData).toBeNull();
      done();
    });
  });

  it('should return "" for getEmailName() initially', done => {
    service.getEmailName().subscribe(email => {
      expect(email).toBe('');
      done();
    });
  });

  it('should return "" for getToken() initially', done => {
    service.getToken().subscribe(token => {
      expect(token).toBe('');
      done();
    });
  });

  it('should return "" for getName() initially', done => {
    service.getName().subscribe(name => {
      expect(name).toBe('');
      done();
    });
  });

  // ----------------------------------------------------------------------------
  // hasPower()
  // ----------------------------------------------------------------------------
  it('should return true if user has "Onboarding" power with action array containing "Execute"', () => {
    (service as any).userPowers = [
      { function: 'Onboarding', action: ['Read', 'Execute', 'Write'] }
    ];
    expect(service.hasPower('Onboarding', 'Execute')).toBe(true);
  });

  it('should return false if user has "Onboarding" power but lacks "Execute"', () => {
    (service as any).userPowers = [
      { function: 'Onboarding', action: ['Read', 'Write'] }
    ];
    expect(service.hasPower('Onboarding', 'Execute')).toBe(false);
  });

  it('should return false if user has no "Onboarding" power', () => {
    (service as any).userPowers = [
      { function: 'OtherFunction', action: 'Execute' }
    ];
    expect(service.hasPower('Onboarding', 'Execute')).toBe(false);
  });

  it('should return false if userPowers is empty', () => {
    (service as any).userPowers = [];
    expect(service.hasPower('Onboarding', 'Execute')).toBe(false);
  });

  // ----------------------------------------------------------------------------
  // hasIn2OrganizationIdentifier()
  // ----------------------------------------------------------------------------
  it('should return true if organizationIdentifier is "VATES-B60645900"', () => {
    (service as any).mandatorSubject.next({
      organizationIdentifier: 'VATES-B60645900'
    });
    expect(service.hasIn2OrganizationIdentifier()).toBe(true);
  });

  it('should return false if organizationIdentifier is not "VATES-B60645900"', () => {
    (service as any).userDataSubject.next({
      organizationIdentifier: 'OTHER'
    });
    expect(service.hasIn2OrganizationIdentifier()).toBe(false);
  });

  it('should return false if userData is null', () => {
    (service as any).userDataSubject.next(null);
    expect(service.hasIn2OrganizationIdentifier()).toBe(false);
  });

  // ----------------------------------------------------------------------------
  // getMandator()
  // ----------------------------------------------------------------------------
  it('should return mandatorSubject as an observable', done => {
    const mockMandator = {
      organizationIdentifier: 'ORG123',
      organization: 'Test Org',
      commonName: 'Some Name',
      emailAddress: 'some@example.com',
      serialNumber: '123',
      country: 'SomeCountry'
    };
    (service as any).mandatorSubject.next(mockMandator);

    service.getMandator().subscribe(mandator => {
      expect(mandator).toEqual(mockMandator);
      done();
    });
  });

  // ----------------------------------------------------------------------------
  // handleLoginCallback()
  // ----------------------------------------------------------------------------
  it('should set userData and token if user is authenticated and has Onboarding Execute (via VC)', done => {
    oidcSecurityServiceMock.checkAuth.mockReturnValue(of({
      isAuthenticated: true,
      userData: mockUserDataWithVC,
      accessToken: 'test-token'
    }));
    // we also want to ensure the 'extractVCFromUserData' is not null
    extractVcSpy.mockReturnValue(mockCredentialEmployee);

    service.handleLoginCallback();

    // Check final states
    service.isLoggedIn().subscribe(isLoggedIn => {
      expect(isLoggedIn).toBe(true);

      service.getUserData().subscribe(ud => {
        expect(ud).toEqual(mockUserDataWithVC);

        service.getToken().subscribe(token => {
          expect(token).toBe('test-token');
          done();
        });
      });
    });
  });

  it('should call logout if user is authenticated, but missing Onboarding Execute power', () => {
    const credWithoutOnboarding = {
      credentialSubject: {
        mandate: {
          mandator: { emailAddress: 'whatever@x.com' },
          mandatee: { firstName: 'x', lastName: 'y' },
          power: [ { function: 'OtherFunction', action: 'Write' } ]
        }
      }
    };

    oidcSecurityServiceMock.checkAuth.mockReturnValue(of({
      isAuthenticated: true,
      userData: { ...mockUserDataWithVC, vc: credWithoutOnboarding },
      accessToken: 'abc'
    }));
    const logoutSpy = jest.spyOn(service, 'logout');

    service.handleLoginCallback();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('should call logout if user is authenticated but has no VC and no cert', () => {
    oidcSecurityServiceMock.checkAuth.mockReturnValue(of({
      isAuthenticated: true,
      userData: mockUserDataNoVCNoCert,
      accessToken: 'some-token'
    }));
    const logoutSpy = jest.spyOn(service, 'logout');

    service.handleLoginCallback();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('should do nothing special (not set subjects) if user is not authenticated', done => {
    oidcSecurityServiceMock.checkAuth.mockReturnValue(of({
      isAuthenticated: false,
      userData: null,
      accessToken: ''
    }));

    service.handleLoginCallback();

    service.isLoggedIn().subscribe(isLoggedIn => {
      expect(isLoggedIn).toBe(false);
      service.getUserData().subscribe(ud => {
        expect(ud).toBeNull();
        service.getToken().subscribe(token => {
          expect(token).toBe('');
          done();
        });
      });
    });
  });

  // ----------------------------------------------------------------------------
  // handleUserAuthentication() - direct coverage
  // ----------------------------------------------------------------------------
  it('should handle Verifiable Credential flow in handleUserAuthentication()', () => {
    // Spy on handleVCLogin to confirm call
    const handleVCLoginSpy = jest.spyOn(service as any, 'handleVCLogin');
    extractVcSpy.mockReturnValue(mockCredentialEmployee);

    (service as any).handleUserAuthentication(mockUserDataWithVC);
    expect(LEARCredentialDataNormalizer.prototype.normalizeLearCredential).toHaveBeenCalled();
    expect(handleVCLoginSpy).toHaveBeenCalled();
    expect(service.roleType()).toBe(RoleType.LEAR);
  });
   
  it('should return the user role if present', () => {
    const mockUserData = { role: RoleType.LEAR } as UserDataAuthenticationResponse;
    const result = (service as any).getRole(mockUserData);
    expect(result).toBe(RoleType.LEAR);
  });

  it('should return undefined if role is not present', () => {
  const mockUserData = {} as UserDataAuthenticationResponse;
  const result = (service as any).getRole(mockUserData);
  expect(result).toBeNull();
  });
  
  it('should extract certificate data correctly', () => {
    const result = (service as any).extractDataFromCertificate(mockUserDataWithCert);

    expect(result).toEqual({
      organizationIdentifier: mockUserDataWithCert.organizationIdentifier,
      organization: mockUserDataWithCert.organization,
      commonName: mockUserDataWithCert.name,
      emailAddress: mockUserDataWithCert.email ,
      serialNumber: mockUserDataWithCert.serialNumber ,
      country: mockUserDataWithCert.country
    });

  })


  it('should catch error if neither VC nor cert is present', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    extractVcSpy.mockReturnValue(null);

    (service as any).handleUserAuthentication(mockUserDataNoVCNoCert);

    expect(consoleErrorSpy).toHaveBeenCalled(); 
  });

    // ----------------------------------------------------------------------------
  // logout$() - direct coverage
  // ----------------------------------------------------------------------------
describe('logout$', () => {
it('should call logoffAndRevokeTokens and postMessage', (done) => {
  const postMessageSpy = jest.spyOn(BroadcastChannel.prototype, 'postMessage').mockImplementation();
  // Assegurar que l'Observable es completa
  oidcSecurityServiceMock.logoffAndRevokeTokens.mockReturnValue(of(null).pipe(
    // Forçar la finalització de l'Observable
    finalize(() => {})
  ));

  service.logout$().subscribe({
    next: () => {
      expect(oidcSecurityServiceMock.logoffAndRevokeTokens).toHaveBeenCalled();
      expect(postMessageSpy).toHaveBeenCalledWith('forceIssuerLogout');
    },
    complete: () => {
      postMessageSpy.mockRestore();
      done(); // Cridar done() quan l'Observable es completa
    }
  });
});

    it('should handle error in logout$', (done) => {
      const error = new Error('logout failed');
      oidcSecurityServiceMock.logoffAndRevokeTokens.mockReturnValue(throwError(() => error));

      service.logout$().subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  // ----------------------------------------------------------------------------
  // checkAuth$() coverage
  // ----------------------------------------------------------------------------
  describe('checkAuth$', ()=> {
  it('should mark user as authenticated and invoke handleUserAuthentication if checkAuth sees a valid user', done => {
    const handleUserAuthSpy = jest.spyOn(service as any, 'handleUserAuthentication');
    oidcSecurityServiceMock.checkAuth.mockReturnValue(of({
      isAuthenticated: true,
      userData: mockUserDataWithVC,
      accessToken: 'xxx'
    }));

    service.checkAuth$().subscribe(() => {
      expect(handleUserAuthSpy).toHaveBeenCalledWith(mockUserDataWithVC);
      service.isLoggedIn().subscribe(isLoggedIn => {
        expect(isLoggedIn).toBe(true);
        done();
      });
    });
  });

  it('should mark user as not authenticated if checkAuth sees isAuthenticated=false', done => {
    oidcSecurityServiceMock.checkAuth.mockReturnValue(of({
      isAuthenticated: false,
      userData: mockUserDataWithCert,
      accessToken: ''
    }));

    service.checkAuth$().subscribe(() => {
      service.isLoggedIn().subscribe(isLoggedIn => {
        expect(isLoggedIn).toBe(false);
        done();
      });
    });
  });

  it('should handle error if checkAuth throws', done => {
  const error = new Error('Some error');
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  oidcSecurityServiceMock.checkAuth.mockReturnValue(throwError(() => error));

  service.checkAuth$().subscribe({
    next: () => {
      // no hauria d'arribar aquí
      fail('Expected an error to be thrown');
    },
    error: err => {
      expect(err).toBe(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Checking authentication: error in initial authentication.'
      );
      done();
    }
  });
});

it('should throw an error if user role is not LEAR', done => {
  const badUserData = { ...mockUserDataWithVC, role: 'SOME_OTHER_ROLE' };
  oidcSecurityServiceMock.checkAuth.mockReturnValue(of({
    isAuthenticated: true,
    userData: badUserData,
    accessToken: 'xxx'
  }));

  service.checkAuth$().subscribe({
    next: () => {
      fail('Expected error due to invalid role');
    },
    error: err => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toContain('Error Role');
      done();
    }
  });
});
});

describe('subscribeToAuthEvents', () => {
  let eventSubject: Subject<any>;

  beforeEach(() => {
    eventSubject = new Subject();

    // Espiar mètodes utilitzats en els switch
    jest.spyOn(service, 'checkAuth$').mockReturnValue(of({ isAuthenticated: false } as any));
    jest.spyOn(service, 'logout$').mockReturnValue(of({}));
    jest.spyOn(service, 'authorize').mockImplementation();

    // Mock de registerForEvents
    mockPublicEventsService.registerForEvents.mockReturnValue(eventSubject.asObservable());
  });

  it('should handle SilentRenewStarted', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

    service.subscribeToAuthEvents();

    eventSubject.next({ type: EventTypes.SilentRenewStarted });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Silent renew started/));

    consoleSpy.mockRestore();
  });

  it('should handle SilentRenewFailed when offline', () => {
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation();

    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    service.subscribeToAuthEvents();

    eventSubject.next({ type: EventTypes.SilentRenewFailed });

    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('offline mode'), expect.anything());
    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));

    consoleWarn.mockRestore();
    consoleInfo.mockRestore();
  });

  it('should handle SilentRenewFailed when online', () => {
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    service.subscribeToAuthEvents();

    eventSubject.next({ type: EventTypes.SilentRenewFailed });

    expect(consoleError).toHaveBeenCalledWith('Silent token refresh failed: online mode, proceeding to logout', expect.anything());
    expect(service.authorize).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('should handle IdTokenExpired', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    service.subscribeToAuthEvents();

    eventSubject.next({ type: EventTypes.IdTokenExpired });

    expect(consoleError).toHaveBeenCalledWith('Session expired:', expect.anything());

    consoleError.mockRestore();
  });

  it('should handle TokenExpired', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    service.subscribeToAuthEvents();

    eventSubject.next({ type: EventTypes.TokenExpired });

    expect(consoleError).toHaveBeenCalledWith('Session expired:', expect.anything());

    consoleError.mockRestore();
  });
});

it('should call .next with certData in handleCertificateLogin', () => {
  const userData = mockUserDataWithCert;
  const certData = { commonName: 'Cert Common Name' };

  const extractSpy = jest
    .spyOn(service as any, 'extractDataFromCertificate')
    .mockReturnValue(certData);

  const mandatorNextSpy = jest.spyOn((service as any).mandatorSubject, 'next');
  const nameNextSpy = jest.spyOn((service as any).nameSubject, 'next');

  (service as any).handleCertificateLogin(userData);

  expect(extractSpy).toHaveBeenCalledWith(userData);
  expect(mandatorNextSpy).toHaveBeenCalledWith(certData);
  expect(nameNextSpy).toHaveBeenCalledWith(certData.commonName);
});

it('should return vc when present in userData', () => {
  const result = (service as any).extractVCFromUserData(mockUserDataWithVC);
  expect(result).toBe(mockUserDataWithVC.vc);
});

it('should throw error when vc is missing in userData', () => {
  expect(() => {
    (service as any).extractVCFromUserData(mockUserDataNoVCNoCert);
  }).toThrowError('VC claim error.');
});

it('should return power array from learCredential', () => {
  const result = (service as any).extractUserPowers(mockCredentialEmployee);
  expect(result).toEqual(mockCredentialEmployee.credentialSubject.mandate.power);
});

it('should return empty array when error occurs accessing power', () => {
  const invalidCredential: any = {};
  const result = (service as any).extractUserPowers(invalidCredential);
  expect(result).toEqual([]);
});
});
