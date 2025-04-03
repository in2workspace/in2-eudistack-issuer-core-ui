import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterOutlet, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AuthService } from 'src/app/core/services/auth.service';
import { of, Subject } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let debugElement: DebugElement;
  let mockAuthService: jest.Mocked<AuthService>;

  mockAuthService = {
    getMandator: () => of(null),
    getEmailName() {
      return of('User Name');
    },
    getName() {
      return of('Name');
    },
    logout() {
      return of(void 0);
    },
    hasIn2OrganizationIdentifier() {
      return true;
    },
    hasPower: () => true,
  } as jest.Mocked<any>;

  let routerEventsSubject: Subject<any>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    routerEventsSubject = new Subject<any>();
    mockRouter = {
      url: '/another',
      events: routerEventsSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        RouterOutlet,
        TranslateModule.forRoot(),
        AppComponent,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: {} } } },
        { provide: Router, useValue: mockRouter },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have title "Credential-issuer-ui"', () => {
    expect(component.title).toBe('Credential-issuer-ui');
  });

  it('should set default language to "en" on initialization', () => {
    const translateService = TestBed.inject(TranslateService);
    expect(translateService.getDefaultLang()).toBe('en');
    expect(translateService.currentLang).toBe('en');
  });

  it('should contain a router-outlet in the template', () => {
    const routerOutlet = debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).not.toBeNull();
  });

  it('should hide navbar if the route is "/home"', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/home', '/home'));
    fixture.detectChanges();

    expect(component.showNavbar$()).toBe(false);
  });

  it('should show navbar if the route is "/another"', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/another', '/another'));
    fixture.detectChanges();

    expect(component.showNavbar$()).toBe(true);
  });

});
