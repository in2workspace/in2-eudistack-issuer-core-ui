import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OidcSecurityService, StsConfigLoader } from "angular-auth-oidc-client";
import { AuthService } from 'src/app/core/services/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA, ViewContainerRef } from '@angular/core';
import { CredentialOfferStepperComponent, loadingBufferTimeInMs, undefinedCredentialOfferParamsState } from './credential-offer-stepper.component';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { HomeComponent } from '../../home/home.component';
import { TemplatePortal } from '@angular/cdk/portal';

(globalThis as any).structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));


describe('Credential Offer Stepper', () => {
  let component: CredentialOfferStepperComponent;
  let fixture: ComponentFixture<CredentialOfferStepperComponent>;
  let procedureService: {
    getCredentialOfferByTransactionCode: jest.Mock,
    getCredentialOfferByCTransactionCode: jest.Mock
  };
  let configService: any

  let oidcSecurityService: {
    checkAuth: jest.Mock,
    authorize: jest.Mock,
    logoff: jest.Mock
  };

  const mockAuthResponse = {
    isAuthenticated: false,
    userData: { emailAddress: 'test@example.com' },
    accessToken: 'dummyAccessToken',
    idToken: 'dummyIdToken'
  };

  beforeEach(async () => {
    configService = { loadConfigs:() => {} };

    oidcSecurityService = {
      checkAuth: jest.fn().mockReturnValue(of(mockAuthResponse)),
      authorize: jest.fn(),
      logoff: jest.fn()
    };
    procedureService = {
        getCredentialOfferByTransactionCode: jest.fn(),
        getCredentialOfferByCTransactionCode: jest.fn()
    }

    await TestBed.configureTestingModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [BrowserAnimationsModule, RouterModule.forRoot([{ path: 'home', component: HomeComponent }]), TranslateModule.forRoot({}), CredentialOfferStepperComponent, HomeComponent],
    providers: [
        AuthService,
        BreakpointObserver,
        // { provide: TranslateService, useValue: translate },
        TranslateService,
        { provide: OidcSecurityService, useValue: oidcSecurityService },
        { provide: StsConfigLoader, useValue: configService },
        { provide: CredentialProcedureService, useValue: procedureService },
        provideHttpClient()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(CredentialOfferStepperComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy(); 
  });

  it('should create actions', () => {
    expect(component.getInitUrlParams$$).toBeDefined();
    expect(component.updateIndex$$).toBeDefined();
    expect(component.loadCredentialOfferOnRefreshClick$$).toBeDefined();
  });

  it('effect should update url params when offer params change', () => {
    const updateSpy = jest.spyOn(component, 'updateUrlParams');
    component.getInitUrlParams$$.next();
    TestBed.flushEffects();
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should initialize stepper orientation to horizontal by default', fakeAsync(() => {
    const breakpointObserverMock = TestBed.inject(BreakpointObserver);
    jest.spyOn(breakpointObserverMock, 'observe').mockReturnValue(of({ matches: true } as any));

    fixture = TestBed.createComponent(CredentialOfferStepperComponent);
    component = fixture.componentInstance;

    tick();
    fixture.detectChanges();

    expect(component.stepperOrientation$()).toBe('horizontal');
}));

it('should set stepper orientation to vertical when screen width is less than 800px', fakeAsync(() => {
    const breakpointObserverMock = TestBed.inject(BreakpointObserver);
    jest.spyOn(breakpointObserverMock, 'observe').mockReturnValue(of({ matches: false } as BreakpointState));

    fixture = TestBed.createComponent(CredentialOfferStepperComponent);
    component = fixture.componentInstance;

    tick();
    fixture.detectChanges();

    expect(component.stepperOrientation$()).toBe('vertical');
}));

it('should update index and step', ()=>{
  expect(component.currentIndex$()).toBe(0);
  expect(component.currentStep$()).toBe('onboarding');
  component.updateIndex$$.next(1);
  expect(component.currentIndex$()).toBe(1);
  expect(component.currentStep$()).toBe('offer');
});

it('should initialize initUrlParams$ correctly', fakeAsync(() => {
  const offerParams = {
    credential_offer_uri: 'cred-offer-uri',
    transaction_code: 'transaction-code-param',
    c_transaction_code: 'c-code-param',
    c_transaction_code_expires_in: 10,
    loading: false,
    error: false
  };
  jest.spyOn(component, 'getUrlParams').mockReturnValue(offerParams);
  
  component.initUrlParams$.subscribe(params => {
    expect(params).toEqual(offerParams);
  });
  component['getInitUrlParams$$'].next();
  tick();
}));

it('should fetch credential offer and emit correct values', fakeAsync(() => {
  const mockParams = { credential_offer_uri: 'cred-uri', c_transaction_code: 'c-code' };
 jest.spyOn(component, 'getCredentialOffer').mockReturnValue(of(mockParams));

 component.fetchedCredentialOffer$.subscribe(paramsState => {
  expect(paramsState).toEqual({
    ...mockParams, loading: false, error: false
  });
 });
}));

it('should gracefully handle error when fetching credentials', fakeAsync(() => {
 jest.spyOn(component, 'getCredentialOffer').mockReturnValue(throwError (()=>new Error()));

 component.fetchedCredentialOffer$.subscribe(paramsState => {
  expect(paramsState).toEqual({ 
    loading: false,
    error: true
  });
 });
}));

it('should emit the correct offerParams$ state when initUrlParams$ and fetchedCredentialOffer$ emit values', () => {
  const firstInitUrlParamsMock = {
    credential_offer_uri: 'cred-one',
    transaction_code: 'trans-one',
    c_transaction_code: 'c-one',
    c_transaction_code_expires_in: 10,
    loading: false,
    error: false
  }; 
  const secondInitOfferMock = {
    credential_offer_uri: 'cred-two',
    transaction_code: 'trans-two',
    c_transaction_code: 'c-two',
    c_transaction_code_expires_in: 20,
    loading: false,
    error: false
  };

  jest.spyOn(component, 'getUrlParams').mockReturnValue(firstInitUrlParamsMock);
  component.getInitUrlParams$$.next();
  jest.spyOn(component, 'getUrlParams').mockReturnValue(secondInitOfferMock);
  component.getInitUrlParams$$.next();
  const result = component.offerParams$();

  expect(result).toEqual({
    ...undefinedCredentialOfferParamsState,
    ...firstInitUrlParamsMock,
    ...secondInitOfferMock,
  });
});

it('should get url params on init', () => {
  const mockSubscriber = jest.fn();
  component.getInitUrlParams$$.subscribe(mockSubscriber);

  component.ngOnInit();

  expect(mockSubscriber).toHaveBeenCalled();
});

describe('startOrEndFirstDountdown', ()=>{

  it('should NOT emit any value if loading is true', (done) => {
    jest.spyOn(component, 'redirectToHome').mockImplementation(() => {});
      const mockOffer = {
        credential_offer_uri: undefined,
        transaction_code: 'mock-trans-code',
        c_transaction_code: 'mock-c-code',
        c_transaction_code_expires_in: 10,
        loading: true,
        error: false
       };
    const spy = jest.fn();
    component['startOrEndFirstCountdown$'].subscribe(spy);
    spy.mockClear();

    Object.defineProperty(component, 'fetchedCredentialOffer$', {
      get: jest.fn(() => of(mockOffer)),
    });
    spy.mockRestore();

    setTimeout(() => {
      expect(spy).not.toHaveBeenCalled();
      done();
    }, 10 * 1000 - loadingBufferTimeInMs);
  });

  it('should NOT emit any value if error is true', (done) => {
    jest.spyOn(component, 'redirectToHome').mockImplementation(() => {});
    const mockOffer = {
      credential_offer_uri: undefined,
      transaction_code: 'mock-trans-code',
      c_transaction_code: 'mock-c-code',
      c_transaction_code_expires_in: 10,
      loading: false,
      error: true
     };
  const spy = jest.fn();
  component['startOrEndFirstCountdown$'].subscribe(spy);
  spy.mockClear();

  Object.defineProperty(component, 'fetchedCredentialOffer$', {
    get: jest.fn(() => of(mockOffer)),
  });
  spy.mockRestore();

  setTimeout(() => {
    expect(spy).not.toHaveBeenCalled();
    done();
  }, 10 * 1000 - loadingBufferTimeInMs);
  });
});

describe('openRefreshPopup', ()=>{
  it('should NOT execute openDialogWithCallback if startOrEndFirstCountdown$ does not emit "END"', () => {
    const dialogSpy = jest.spyOn(component['dialog'], 'openErrorInfoDialog');
    Object.defineProperty(component, 'startOrEndFirstCountdown$', {
      get: jest.fn(() => of('START'))
    });

    component['openRefreshPopupEffect'].subscribe();

    expect(dialogSpy).not.toHaveBeenCalled();
  });

  it('should execute openDialogWithCallback with correct parameters when startOrEndFirstCountdown$ emits "END"', () => {
    const mockTemplate = new TemplatePortal(component.popupCountdown, {} as ViewContainerRef);
    const dialogSpy = jest.spyOn(component['dialog'], 'openErrorInfoDialog');

    Object.defineProperty(component, 'startOrEndFirstCountdown$', {
      get: jest.fn(() => of('END')),
    });

    component['openRefreshPopupEffect'].subscribe(()=>{
      expect(dialogSpy).toHaveBeenCalledWith(
        {
          title: 'Session timeout',
          message: '',
          template: expect.any(TemplatePortal),
          confirmationType: 'async',
          status: 'default',
          confirmationLabel: 'Refresh',
          cancelLabel: 'Leave'
        },
        expect.any(Function),
        expect.any(Function),
        'DISABLE_CLOSE' 
      );
    });

  });
});

describe('closeRefreshPopupEffect', () => {
  it('should close all dialogs when countdown emits "START"', () => {
    const closeSpy = jest.spyOn(component['dialog']['dialog'], 'closeAll');
    const originalProperty = Object.getOwnPropertyDescriptor(component, 'startOrEndFirstCountdown$');

    Object.defineProperty(component, 'startOrEndFirstCountdown$', {
      get: jest.fn(() => of('START')),
    });

    component['closeRefreshPopupEffect'].subscribe(() => {
      expect(closeSpy).toHaveBeenCalled();
    });

    if (originalProperty) {
      Object.defineProperty(component, 'startOrEndFirstCountdown$', originalProperty);
    }
  });

  it('should NOT close dialogs when countdown does NOT emit "START"', () => {
    const closeSpy = jest.spyOn(component['dialog']['dialog'], 'closeAll');
    const originalProperty = Object.getOwnPropertyDescriptor(component, 'startOrEndFirstCountdown$');

    Object.defineProperty(component, 'startOrEndFirstCountdown$', {
      get: jest.fn(() => of('END')),
    });

    component['closeRefreshPopupEffect'].subscribe(() => {
      expect(closeSpy).not.toHaveBeenCalled();
    });

    if (originalProperty) {
      Object.defineProperty(component, 'startOrEndFirstCountdown$', originalProperty);
    }
  });
});

describe('navigateHomeAfterEndSessionEffect', () => {
  it('should redirect to home and show error dialog when countdown reaches 0', () => {
    const errorMessage = 'Offer expired';
    const translatedMsg = component['translate'].instant(errorMessage);
    const dialogSpy = jest.spyOn(component['dialog'], 'openErrorInfoDialog');
    const redirectSpy = jest.spyOn(component, 'redirectToHome');
    const originalProperty = Object.getOwnPropertyDescriptor(component, 'endSessionCountdown$');

    Object.defineProperty(component, 'endSessionCountdown$', {
      get: jest.fn(() => of(0)),
    });

    component['navigateHomeAfterEndSessionEffect'].subscribe(() => {
      expect(redirectSpy).toHaveBeenCalled();
      expect(dialogSpy).toHaveBeenCalledWith(translatedMsg);
    });

    if (originalProperty) {
      Object.defineProperty(component, 'endSessionCountdown$', originalProperty);
    }
  });

  it('should NOT redirect to home and NOT show error dialog when countdown does NOT reach 0', () => {
    const dialogSpy = jest.spyOn(component['dialog'], 'openErrorInfoDialog');
    const redirectSpy = jest.spyOn(component, 'redirectToHome');
    const originalProperty = Object.getOwnPropertyDescriptor(component, 'endSessionCountdown$');

    Object.defineProperty(component, 'endSessionCountdown$', {
      get: jest.fn(() => of(10)),
    });

    component['navigateHomeAfterEndSessionEffect'].subscribe();

    expect(redirectSpy).not.toHaveBeenCalled();
    expect(dialogSpy).not.toHaveBeenCalled();

    if (originalProperty) {
      Object.defineProperty(component, 'endSessionCountdown$', originalProperty);
    }
  });
});


describe('endSessionCountdown', () => {
  it('should count down when startOrEndFirstCountdown$ emits "END"', fakeAsync(() => {
    const popupTimeInSeconds = 10;
  
    (component as any).startOrEndFirstCountdown$ = new BehaviorSubject<string>('END');
    (component as any).fetchedCredentialOffer$ = new BehaviorSubject<{ loading: boolean }>({ loading: false });
  
    component.endSessionCountdown$.subscribe(value => {
      expect(value).toBeLessThanOrEqual(popupTimeInSeconds);
    });
  
    tick((popupTimeInSeconds + 2) * 1000);
  }));
  
  it('should reset countdown when startOrEndFirstCountdown$ emits other than "END"', () => {
    const popupTimeInSeconds = 10;
  
    (component as any).startOrEndFirstCountdown$ = new BehaviorSubject<string>('START');
  
    component.endSessionCountdown$.subscribe(value => {
      expect(value).toBe(popupTimeInSeconds);
    });
  });
});
describe('onSelectedStepChange', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should log an error for an unexpected index', () => {
    component.onSelectedStepChange(2); // Invalid index
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected index');
  });

  it('should emit a new index if it changes and is valid', () => {
    const newIndex = 1;
    const updateIndexSpy = jest.spyOn(component.updateIndex$$, 'next');
    
    jest.spyOn(component, 'currentIndex$').mockReturnValue(0);
    component.onSelectedStepChange(newIndex);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(updateIndexSpy).toHaveBeenCalledWith(newIndex);
  });

  it('should not emit a new index if the index is the same', () => {
    const currentIndex = 1;
    const updateIndexSpy = jest.spyOn(component.updateIndex$$, 'next');
    
    jest.spyOn(component, 'currentIndex$').mockReturnValue(currentIndex);
    component.onSelectedStepChange(currentIndex);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(updateIndexSpy).not.toHaveBeenCalled();
  });
});

  describe('getUrlParams', () => {
    let consoleErrorSpy: jest.SpyInstance;
  
    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
  
    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });
  
    it('should log an error if transaction_code is missing', () => {
      component['route'].snapshot.queryParams = { c: 'someCCode' };
      const result = component.getUrlParams();
  
      expect(consoleErrorSpy).toHaveBeenCalledWith("Client error: Missing transaction code in the URL. Can't get credential offer.");
      expect(result).toEqual({
        credential_offer_uri: undefined,
        transaction_code: undefined,
        c_transaction_code: 'someCCode',
        loading: false,
        error: false
      });
    });
  
    it('should return updated params with transaction_code and c', () => {
      component['route'].snapshot.queryParams = {
        transaction_code: 'transaction123',
        c: 'someCCode'
      };
      const result = component.getUrlParams();
  
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        credential_offer_uri: undefined,
        transaction_code: 'transaction123',
        c_transaction_code: 'someCCode',
        loading: false,
        error: false
      });
    });
  
    it('should return default values for missing c_transaction_code', () => {
      component['route'].snapshot.queryParams = {
        transaction_code: 'transaction123'
      };
      const result = component.getUrlParams();
  
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        credential_offer_uri: undefined,
        transaction_code: 'transaction123',
        c_transaction_code: undefined,
        loading: false,
        error: false
      });
    });
  });


describe('getCredentialOffer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error when no transaction_code or c_transaction_code is available', (done) => {
    jest.spyOn(component, 'offerParams$').mockReturnValue(undefinedCredentialOfferParamsState);
    const dialogSpy = jest.spyOn(component['dialog'], 'openErrorInfoDialog');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const message = component['translate'].instant("error.credentialOffer.invalid-url");

    component.getCredentialOffer().subscribe({
      error: (error) => {
        expect(error.message).toBe('No transaction nor c code to fetch credential offer.');
        expect(consoleErrorSpy).toHaveBeenCalledWith("Client error: Transaction code not found. Can't get credential offer");
        expect(dialogSpy).toHaveBeenCalledWith(DialogComponent, message);
        done();
      }
    });
  });

  it('should fetch credential offer by c_transaction_code', () => {
    const mockCTransactionCode = 'mockCTransactionCode';
    const mockOffer = {
      credential_offer_uri: undefined,
      transaction_code: 'mock-trans-code',
      c_transaction_code: mockCTransactionCode,
      c_transaction_code_expires_in: 10,
      loading: false,
      error: false
    };
    const mockResponse = {
      credential_offer_uri: 'some uri',
      c_transaction_code: 'someCCode'
    };

    jest.spyOn(component, 'offerParams$').mockReturnValue(mockOffer);
    procedureService.getCredentialOfferByCTransactionCode.mockReturnValue(of(mockResponse));

    component.getCredentialOffer().subscribe((result) => {
      expect(procedureService.getCredentialOfferByCTransactionCode).toHaveBeenCalledWith(mockCTransactionCode);
      expect(result).toEqual(mockResponse);
    });
  });

  it('should fetch credential offer by transaction_code', () => {
    const mockTransactionCode = 'mockTransactionCode';
    const mockOffer = {
      credential_offer_uri: undefined,
      transaction_code: mockTransactionCode,
      c_transaction_code: undefined,
      c_transaction_code_expires_in: 10,
      loading: false,
      error: false
    };
    const mockResponse = {
      credential_offer_uri: 'some uri',
      c_transaction_code: 'someCCode'
    };

    jest.spyOn(component, 'offerParams$').mockReturnValue(mockOffer);
    procedureService.getCredentialOfferByTransactionCode.mockReturnValue(of(mockResponse));

    component.getCredentialOffer().subscribe((result) => {
      expect(procedureService.getCredentialOfferByTransactionCode).toHaveBeenCalledWith(mockTransactionCode);
      expect(result).toEqual(mockResponse);
    });
  });
});

describe('getCredentialOfferByTransactionCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open error dialog and throw an error when transactionCode is missing', (done) => {
    const dialogSpy = jest.spyOn(component['dialog'], 'openErrorInfoDialog');
    const redirectSpy = jest.spyOn(component, 'redirectToHome');
    const message = component['translate'].instant("error.credentialOffer.invalid-url");

    const result$ = component.getCredentialOfferByTransactionCode('');

    result$.subscribe({
      error: (error) => {
        expect(dialogSpy).toHaveBeenCalledWith(DialogComponent, message);
        expect(error).toEqual(new Error());
        expect(redirectSpy).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should call the service and return the credential offer when transactionCode is valid', (done) => {
    const mockTransactionCode = 'validTransactionCode';
    const mockResponse = { credential_offer_uri: 'offer uri', c_transaction_code: 'Test c' };

    procedureService.getCredentialOfferByTransactionCode.mockReturnValue(of(mockResponse));

    const result$ = component.getCredentialOfferByTransactionCode(mockTransactionCode);

    result$.subscribe((response) => {
      expect(procedureService.getCredentialOfferByTransactionCode)
        .toHaveBeenCalledWith(mockTransactionCode);
      expect(response).toEqual(mockResponse);
      done();
    });
  });


});
describe('getCredentialOfferByCTransactionCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open error dialog and throw an error when cTransactionCode is missing', (done) => {
    const redirectSpy = jest.spyOn(component, 'redirectToHome');
    const dialogSpy = jest.spyOn(component['dialog'], 'openErrorInfoDialog');
    const message = component['translate'].instant("error.credentialOffer.invalid-url");

    const result$ = component.getCredentialOfferByCTransactionCode('');

    result$.subscribe({
      error: (error) => {
        expect(dialogSpy).toHaveBeenCalledWith(DialogComponent, message);
        expect(redirectSpy).toHaveBeenCalled();
        expect(error).toEqual(new Error());
        done();
      }
    });
  });

  it('should call the service and return the credential offer when cTransactionCode is valid', (done) => {
    const mockTransactionCode = 'validCTransactionCode';
    const mockResponse = { credential_offer_uri: 'offer uri', c_transaction_code: 'Test c' };

    procedureService.getCredentialOfferByCTransactionCode.mockReturnValue(of(mockResponse));

    const result$ = component.getCredentialOfferByCTransactionCode(mockTransactionCode);

    result$.subscribe((response) => {
      expect(procedureService.getCredentialOfferByCTransactionCode)
        .toHaveBeenCalledWith(mockTransactionCode);
      expect(response).toEqual(mockResponse);
      done();
    });
  });

});

it('should not navigate when c_transaction_code is not provided', () => {
  const mockParams = { c_transaction_code: null } as any;
  const navigateSpy = jest.spyOn(component['router'], 'navigate');

  component.updateUrlParams(mockParams);

  expect(navigateSpy).not.toHaveBeenCalled();
});

it('should navigate when c_transaction_code is provided', () => {
  const mockParams = { c_transaction_code: 'valid-code' } as any;
  const navigateSpy = jest.spyOn(component['router'], 'navigate');

  component.updateUrlParams(mockParams);

  expect(navigateSpy).toHaveBeenCalled();
});

  it('should call next on loadCredentialOfferOnRefreshClick$$ when onRefreshCredentialClick is called', () => {
    const nextSpy = jest.spyOn(component.loadCredentialOfferOnRefreshClick$$, 'next');

    component.onRefreshCredentialClick();
  
    expect(nextSpy).toHaveBeenCalled();
  });
  
  it('should navigate to "/home" when redirectToHome is called', () => {
    const routerSpy = jest.spyOn(component['router'],'navigate');
    component.redirectToHome();
  
    setTimeout(()=>{
      expect(routerSpy).toHaveBeenCalledWith(['/home']);
    }, 1000);
  });

  it('should navigate to home and open VC-expired popup', ()=>{
    const redirectSpy = jest.spyOn(component, 'redirectToHome');
    const dialogOpenSpy = jest.spyOn(component['dialog'], 'openErrorInfoDialog');
    const message = component['translate'].instant("error.credentialOffer.not-found");

    component.redirectToHomeAndShowErrorDialog(message);

    expect(redirectSpy).toHaveBeenCalled();
    expect(dialogOpenSpy).toHaveBeenCalled();
    expect(dialogOpenSpy).toHaveBeenCalledWith(DialogComponent, message);
  });

  
  describe('openRefreshPopupEffect', () => {
    let openDialogSpy: jest.SpyInstance;
    let redirectSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    const dialogWrapperServiceMock = {
      openDialogWithCallback: jest.fn(),
      openErrorInfoDialog: jest.fn(),
      dialog: {
        closeAll: jest.fn()
      }
    };

    beforeEach(() => {
      openDialogSpy = jest.spyOn(dialogWrapperServiceMock, 'openDialogWithCallback');
      redirectSpy = jest.spyOn(component as any, 'redirectToHomeAndShowErrorDialog');
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should not execute cancel callback when afterClosed emits true', fakeAsync(() => {
      (component as any).startOrEndFirstCountdown$ = of('END');
      const fakeDialogRef = { afterClosed: jest.fn(() => of(true)) };
      openDialogSpy.mockReturnValue(fakeDialogRef as any);
  
      (component as any).openRefreshPopupEffect.subscribe();
      tick();
  
      expect(redirectSpy).not.toHaveBeenCalled();
    }));

  
    it('should not execute cancel callback when afterClosed emits true', fakeAsync(() => {
      Object.defineProperty(component, 'startOrEndFirstCountdown$', { get: () => of('END') });
      const fakeDialogRef = { afterClosed: jest.fn(() => of(true)) };
      openDialogSpy.mockReturnValue(fakeDialogRef as any);

      component['openRefreshPopupEffect'].subscribe();
      tick();

      expect(redirectSpy).not.toHaveBeenCalled();
    }));

    it('should handle error from afterClosed observable', fakeAsync(() => {
      Object.defineProperty(component, 'startOrEndFirstCountdown$', { get: () => of('END') });
      const fakeDialogRef = { afterClosed: jest.fn(() => throwError(() => new Error('Test error'))) };
      openDialogSpy.mockReturnValue(fakeDialogRef as any);

      component['openRefreshPopupEffect'].subscribe({
        error: () => {} 
      });
      tick();

      expect(consoleErrorSpy).toHaveBeenCalled();
    }));

    it('should execute cancel callback when afterClosed emits false', fakeAsync(() => {
      Object.defineProperty(component, 'startOrEndFirstCountdown$', { get: () => of('END') });
    
      const redirectSpy = jest.spyOn(component as any, 'redirectToHomeAndShowErrorDialog');
      const fakeDialogRef = { afterClosed: jest.fn(() => of(false)) };
      openDialogSpy.mockReturnValue(fakeDialogRef as any);
    
      component['openRefreshPopupEffect'].subscribe(() => {
        expect(redirectSpy).toHaveBeenCalledWith("error.credentialOffer.not-found");
      });
    
      tick();
    }));

  });

  it('should emit on destroy$$ when ngOnDestroy is called', () => {
    const destroySpy = jest.fn();
    component.destroy$$.subscribe(destroySpy);
    (component as any).ngOnDestroy();
    expect(destroySpy).toHaveBeenCalled();
  });
  

});
