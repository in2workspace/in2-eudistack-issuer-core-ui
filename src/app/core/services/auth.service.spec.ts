import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { UserDataAuthenticationResponse } from '../models/dto/user-data-authentication-response.dto';
import { CredentialStatus, LEARCredentialEmployee } from '../models/entity/lear-credential';
import { RoleType } from '../models/enums/auth-rol-type.enum';
import { LEARCredentialDataNormalizer } from 'src/app/features/credential-details/utils/lear-credential-data-normalizer';

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
        id: 'mandator-id',
        organizationIdentifier: 'ORG123',
        organization: 'Test Organization',
        commonName: 'Mandator Name',
        email: 'mandator@example.com',
        serialNumber: '123456',
        country: 'Testland'
      },
      mandatee: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'jhonDoe@example.com',
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
    id: 'id-issuer',
    organizationIdentifier: 'ORG123',
    organization: 'Test Organization',
    commonName: 'Mandator Name',
    serialNumber: '123456',
    country: 'Testland'
  },
  validFrom: '2024-01-01T00:00:00Z',
  validUntil: '2024-12-31T23:59:59Z',
  issuanceDate: '2024-01-01T00:00:00Z',
  expirationDate: '2024-12-31T23:59:59Z'
};

const mockUserDataWithVC: UserDataAuthenticationResponse = {
  id: 'id',
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
  id: 'id',
  sub: 'subCert',
  commonName: 'Cert Common Name',
  country: 'CertLand',
  serial_number: '99999999',
  serialNumber: '99999999',
  email_verified: true,
  preferred_username: 'certUser',
  given_name: 'CertGivenName',
  'tenant-id': 'tenant-123',
  email: 'cert-user@example.com',
  emailAddress: 'cert-user@example.com',
  organizationIdentifier: 'ORG-CERT',
  organization: 'Cert Organization',
  name: 'John Cert',
  family_name: 'Cert',
  role: RoleType.LEAR
};

const mockUserDataNoVCNoCert: UserDataAuthenticationResponse = {
  id: 'id',
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

  let oidcSecurityServiceMock: {
    checkAuth: jest.Mock,
    logoff: jest.Mock,
    authorize: jest.Mock,
    logoffAndRevokeTokens: jest.Mock
  };

  let extractVcSpy: jest.SpyInstance;

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
    };

    jest.spyOn(LEARCredentialDataNormalizer.prototype, 'normalizeLearCredential')
      .mockImplementation((data) => data);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
        { provide: PublicEventsService, useValue: mockPublicEventsService }
      ]
    });

    service = TestBed.inject(AuthService);
    extractVcSpy = jest.spyOn(service as any, 'extractVCFromUserData');

    jest.clearAllMocks();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // creació / login / logout bàsic
  // --------------------------------------------------------------------------
  it('hauria de crear-se', () => {
    expect(service).toBeTruthy();
  });

  it('login(): truca authorize a OidcSecurityService', () => {
    service.login();
    expect(oidcSecurityServiceMock.authorize).toHaveBeenCalled();
  });

  it('logout(): truca logoffAndRevokeTokens', () => {
    service.logout();
    expect(oidcSecurityServiceMock.logoffAndRevokeTokens).toHaveBeenCalled();
  });

  // --------------------------------------------------------------------------
  // observables inicials
  // --------------------------------------------------------------------------
  it('isLoggedIn() inicialment false', (done) => {
    service.isLoggedIn().subscribe(v => {
      expect(v).toBe(false);
      done();
    });
  });

  it('getUserData() inicialment null', (done) => {
    service.getUserData().subscribe(v => {
      expect(v).toBeNull();
      done();
    });
  });

  it('getMandateeEmail() inicialment ""', () => {
    expect(service.getMandateeEmail()).toBe('');
  });

  it('getToken() inicialment ""', (done) => {
    service.getToken().subscribe(v => {
      expect(v).toBe('');
      done();
    });
  });

  it('getName() inicialment ""', (done) => {
    service.getName().subscribe(v => {
      expect(v).toBe('');
      done();
    });
  });

  // --------------------------------------------------------------------------
  // hasPower()
  // --------------------------------------------------------------------------
  it('true si té "Onboarding" i acció "Execute"', () => {
    (service as any).userPowers = [
      { function: 'Onboarding', action: ['Read', 'Execute', 'Write'] }
    ];
    expect(service.hasPower('Onboarding', 'Execute')).toBe(true);
  });

  it('false si no té "Execute"', () => {
    (service as any).userPowers = [
      { function: 'Onboarding', action: ['Read', 'Write'] }
    ];
    expect(service.hasPower('Onboarding', 'Execute')).toBe(false);
  });

  it('false si no té "Onboarding"', () => {
    (service as any).userPowers = [
      { function: 'OtherFunction', action: 'Execute' }
    ];
    expect(service.hasPower('Onboarding', 'Execute')).toBe(false);
  });

  it('false si userPowers és buit', () => {
    (service as any).userPowers = [];
    expect(service.hasPower('Onboarding', 'Execute')).toBe(false);
  });

  // --------------------------------------------------------------------------
  // hasIn2OrganizationIdentifier()
  // --------------------------------------------------------------------------
  it('true si organizationIdentifier és "VATES-B60645900"', () => {
    (service as any).mandatorSubject.next({
      organizationIdentifier: 'VATES-B60645900'
    });
    expect(service.hasIn2OrganizationIdentifier()).toBe(true);
  });

  it('false si organizationIdentifier és diferent', () => {
    (service as any).mandatorSubject.next({
      organizationIdentifier: 'OTHER'
    });
    expect(service.hasIn2OrganizationIdentifier()).toBe(false);
  });

  it('false si mandator és null', () => {
    (service as any).mandatorSubject.next(null);
    expect(service.hasIn2OrganizationIdentifier()).toBe(false);
  });

  // --------------------------------------------------------------------------
  // getMandator()
  // --------------------------------------------------------------------------
  it('getMandator() retorna l’observable amb el mandator', (done) => {
    const mockMandator = {
      id: 'mandator-id',
      organizationIdentifier: 'ORG123',
      organization: 'Test Org',
      commonName: 'Some Name',
      email: 'some@example.com',
      serialNumber: '123',
      country: 'SomeCountry'
    };
    (service as any).mandatorSubject.next(mockMandator);

    service.getMandator().subscribe(m => {
      expect(m).toEqual(mockMandator);
      done();
    });
  });

  // --------------------------------------------------------------------------
  // handleLoginCallback()
  // --------------------------------------------------------------------------
  it('setejaria userData i token si autenticat i amb VC vàlid', (done) => {
  oidcSecurityServiceMock.checkAuth.mockReturnValue(of({
    isAuthenticated: true,
    userData: mockUserDataWithVC,
    accessToken: 'test-token'
  }));
  extractVcSpy.mockReturnValue(mockCredentialEmployee);

  service.handleLoginCallback();

  service.isLoggedIn().subscribe(isLogged => {
    expect(isLogged).toBe(true);
    service.getUserData().subscribe(ud => {
      expect(ud).toEqual(mockUserDataWithVC);
      service.getToken().subscribe(token => {
        expect(token).toBe('test-token');
        done();
      });
    });
  });
});

it('omple el correu del mandatee després de handleUserAuthentication()', () => {
  extractVcSpy.mockReturnValue(mockCredentialEmployee);

  (service as any).handleUserAuthentication(mockUserDataWithVC);

  expect(service.getMandateeEmail()).toBe('jhonDoe@example.com');
});



  it('fa logout si autenticat però sense power Onboarding Execute', () => {
    const credWithoutOnboarding = {
      credentialSubject: {
        mandate: {
          mandator: { email: 'whatever@x.com' },
          mandatee: { firstName: 'x', lastName: 'y' },
          power: [{ function: 'OtherFunction', action: 'Write' }]
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

  it('fa logout si autenticat però sense VC ni cert', () => {
    oidcSecurityServiceMock.checkAuth.mockReturnValue(of({
      isAuthenticated: true,
      userData: mockUserDataNoVCNoCert,
      accessToken: 'some-token'
    }));
    const logoutSpy = jest.spyOn(service, 'logout');

    service.handleLoginCallback();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('no canvia estats si no autenticat', (done) => {
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

  // --------------------------------------------------------------------------
  // handleUserAuthentication()
  // --------------------------------------------------------------------------
  it('gestiona el flux VC a handleUserAuthentication()', () => {
    const handleVCLoginSpy = jest.spyOn(service as any, 'handleVCLogin');
    extractVcSpy.mockReturnValue(mockCredentialEmployee);

    (service as any).handleUserAuthentication(mockUserDataWithVC);
    expect(LEARCredentialDataNormalizer.prototype.normalizeLearCredential).toHaveBeenCalled();
    expect(handleVCLoginSpy).toHaveBeenCalled();
    expect(service.roleType()).toBe(RoleType.LEAR);
  });

  it('getRole retorna el rol si existeix', () => {
    const mockUserData = { role: RoleType.LEAR } as UserDataAuthenticationResponse;
    const result = (service as any).getRole(mockUserData);
    expect(result).toBe(RoleType.LEAR);
  });

  it('getRole retorna null si no hi ha role', () => {
    const mockUserData = {} as UserDataAuthenticationResponse;
    const result = (service as any).getRole(mockUserData);
    expect(result).toBeNull();
  });

  it('extractDataFromCertificate extreu dades correctament', () => {
    const result = (service as any).extractDataFromCertificate(mockUserDataWithCert);
    expect(result).toEqual({
      id: mockUserDataWithCert.id,
      organizationIdentifier: mockUserDataWithCert.organizationIdentifier,
      organization: mockUserDataWithCert.organization,
      commonName: mockUserDataWithCert.name,
      email: mockUserDataWithCert.email ?? '',
      serialNumber: mockUserDataWithCert.serial_number ?? '',
      country: mockUserDataWithCert.country
    });
  });

  it('handleUserAuthentication captura error si no hi ha VC ni cert', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    extractVcSpy.mockReturnValue(null);

    (service as any).handleUserAuthentication(mockUserDataNoVCNoCert);

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // --------------------------------------------------------------------------
  // logout$()
  // --------------------------------------------------------------------------
  describe('logout$', () => {
    it('truca logoffAndRevokeTokens i completa', (done) => {
      oidcSecurityServiceMock.logoffAndRevokeTokens.mockReturnValue(of(null));

      service.logout$().subscribe({
        next: () => {
          expect(oidcSecurityServiceMock.logoffAndRevokeTokens).toHaveBeenCalled();
        },
        complete: () => done()
      });
    });

    it('propaga error a logout$', (done) => {
      const error = new Error('logout failed');
      oidcSecurityServiceMock.logoffAndRevokeTokens.mockReturnValue(throwError(() => error));

      service.logout$().subscribe({
        next: () => {
          fail('S’esperava un error');
        },
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // checkAuth$()
  // --------------------------------------------------------------------------
  describe('checkAuth$', () => {
    it('marca autenticat i invoca handleUserAuthentication si vàlid', (done) => {
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

    it('marca no autenticat si isAuthenticated=false', (done) => {
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

    it('propaga error si checkAuth llença', (done) => {
      const error = new Error('Some error');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      oidcSecurityServiceMock.checkAuth.mockReturnValue(throwError(() => error));

      service.checkAuth$().subscribe({
        next: () => {
          fail('S’esperava un error');
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

    it('llença error si el rol no és LEAR', (done) => {
      const badUserData = { ...mockUserDataWithVC, role: 'SOME_OTHER_ROLE' } as any;
      oidcSecurityServiceMock.checkAuth.mockReturnValue(of({
        isAuthenticated: true,
        userData: badUserData,
        accessToken: 'xxx'
      }));

      service.checkAuth$().subscribe({
        next: () => {
          fail('S’esperava error per rol invàlid');
        },
        error: err => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toContain('Error Role');
          done();
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // subscribeToAuthEvents
  // --------------------------------------------------------------------------
  describe('subscribeToAuthEvents', () => {
    let eventSubject: Subject<any>;

    beforeEach(() => {
      eventSubject = new Subject();
      jest.spyOn(service, 'checkAuth$').mockReturnValue(of({ isAuthenticated: false } as any));
      jest.spyOn(service, 'logout$').mockReturnValue(of({}));
      jest.spyOn(service, 'authorize').mockImplementation();
      mockPublicEventsService.registerForEvents.mockReturnValue(eventSubject.asObservable());
    });

    it('gestiona SilentRenewStarted', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      service.subscribeToAuthEvents();
      eventSubject.next({ type: EventTypes.SilentRenewStarted });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Silent renew started/));
      consoleSpy.mockRestore();
    });

    it('gestiona SilentRenewFailed offline', () => {
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

    it('gestiona SilentRenewFailed online → authorize()', () => {
      jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      service.subscribeToAuthEvents();
      eventSubject.next({ type: EventTypes.SilentRenewFailed });

      expect(consoleError).toHaveBeenCalledWith('Silent token refresh failed: online mode, proceeding to logout', expect.anything());
      expect(service.authorize).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('gestiona IdTokenExpired', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      service.subscribeToAuthEvents();
      eventSubject.next({ type: EventTypes.IdTokenExpired });
      expect(consoleWarn).toHaveBeenCalledWith('Session expired:', expect.anything());
      consoleWarn.mockRestore();
    });

    it('gestiona TokenExpired', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      service.subscribeToAuthEvents();
      eventSubject.next({ type: EventTypes.TokenExpired });
      expect(consoleWarn).toHaveBeenCalledWith('Session expired:', expect.anything());
      consoleWarn.mockRestore();
    });
  });

  // --------------------------------------------------------------------------
  // helpers privats
  // --------------------------------------------------------------------------
  it('extractVCFromUserData retorna vc si present', () => {
    const result = (service as any).extractVCFromUserData(mockUserDataWithVC);
    expect(result).toBe(mockUserDataWithVC.vc);
  });

  it('extractVCFromUserData llença error si falta vc', () => {
    expect(() => {
      (service as any).extractVCFromUserData(mockUserDataNoVCNoCert);
    }).toThrowError('VC claim error.');
  });

  it('extractUserPowers retorna l’array de power', () => {
    const result = (service as any).extractUserPowers(mockCredentialEmployee);
    expect(result).toEqual(mockCredentialEmployee.credentialSubject.mandate.power);
  });

  it('extractUserPowers retorna [] si hi ha error', () => {
    const invalidCredential: any = {};
    const result = (service as any).extractUserPowers(invalidCredential);
    expect(result).toEqual([]);
  });
});
