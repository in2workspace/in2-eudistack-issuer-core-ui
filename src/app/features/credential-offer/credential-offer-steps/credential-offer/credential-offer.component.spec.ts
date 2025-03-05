import { TestBed } from '@angular/core/testing';
import { CredentialOfferComponent } from './credential-offer.component';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeModule } from 'angularx-qrcode';
import { NgIf } from '@angular/common';
import { environment } from 'src/environments/environment';

describe('CredentialOfferComponent', () => {
  let component: CredentialOfferComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgIf, QRCodeModule, TranslateModule.forRoot(), CredentialOfferComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CredentialOfferComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set the QR color to "#2d58a7"', () => {
    expect(component.qrColor).toBe('#2d58a7');
  });

  it('should initialize walletUsersGuideUrl with the correct value from the environment', () => {
    const expectedGuideUrl = environment.knowledge.base_url + 'books/dome-digital-wallet-user-guide';
    expect(component.walletUsersGuideUrl).toBe(expectedGuideUrl);
  });

  it('should initialize walletSameDeviceUrl with the correct value from the environment', () => {
    const expectedUrl = environment.wallet_url + 'tabs/home/';
    expect(component.walletSameDeviceUrl).toBe(expectedUrl);
  });

  it('should compute walletSameDeviceUrl$ correctly when credentialOfferUri$ is provided', () => {
    const credentialOfferUriMock = 'mockCredentialOfferUri';
    (component as any).credentialOfferUri$ = () => credentialOfferUriMock;
  
    const expectedComputedUrl =
      environment.wallet_url + 'tabs/home/' + credentialOfferUriMock;
  
    expect(component.walletSameDeviceUrl$()).toBe(expectedComputedUrl);
  });

  it('should get profile', () => {
    expect(component.profile).toBe(environment.profile);
  });

  it('should initialize walletSameDeviceTestUrl with the correct value from the environment', () => {
    const expectedTestUrl = environment.wallet_url_test + 'tabs/home/';
    expect(component.walletSameDeviceTestUrl).toBe(expectedTestUrl);
  });

  it('should compute walletSameDeviceTestUrl$ correctly when credentialOfferUri$ is provided', () => {
    const credentialOfferUriMock = 'mockCredentialOfferUri';
    (component as any).credentialOfferUri$ = () => credentialOfferUriMock;
  
    const expectedComputedTestUrl =
      environment.wallet_url_test + 'tabs/home/' + credentialOfferUriMock;
  
    expect(component.walletSameDeviceTestUrl$()).toBe(expectedComputedTestUrl);
  });

  it('should remove the protocol from the given URL string', () => {
    const inputUrl = 'https://example.com';
    const expectedOutput = 'httpsexample.com';
    
    const result = component.removeProtocol(inputUrl);
    
    expect(result).toBe(expectedOutput);
  });

  it('should emit refreshCredential when onRefreshCredentialClick is called', () => {
    const eventMock = { preventDefault: jest.fn() } as unknown as Event;

    const emitSpy = jest.spyOn(component.refreshCredential, 'emit');

    component.onRefreshCredentialClick(eventMock);

    expect(eventMock.preventDefault).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
  });
});
