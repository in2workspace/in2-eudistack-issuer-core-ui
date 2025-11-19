import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: jest.Mocked<Router>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    const routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    const authServiceMock = {
      login: jest.fn(),
      logout: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        TranslateModule.forRoot({}),
      ],
      providers: [
        TranslateService,
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should get logo source', () => {
    expect(component.logoSrc).toBe(
      '../../../assets/logos/' + environment.customizations.logo_src,
    );
  });

  it('should set walletUrl and knowledge_base_url from environment', () => {
    expect(component.walletUrl).toBe(environment.wallet_url ?? '');
    expect(component.knowledge_base_url).toBe(environment.knowledge_base_url);
  });

  it('should call authService.login when login() is called', () => {
    component.login();
    expect(authService.login).toHaveBeenCalled();
  });

  it('should call authService.logout and navigate to /login when logout() is called', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should scroll to login section when scrollToLoginSection() is called', () => {
    const scrollIntoViewMock = jest.fn();

    component.loginSection = {
      nativeElement: {
        scrollIntoView: scrollIntoViewMock,
      } as unknown as HTMLElement,
    } as any;

    component.scrollToLoginSection();

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
