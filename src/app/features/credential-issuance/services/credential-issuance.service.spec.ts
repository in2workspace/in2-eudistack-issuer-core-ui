import { TestBed } from '@angular/core/testing';
import { CredentialIssuanceService } from './credential-issuance.service';


describe('CredentialIssuanceService', () => {
  let service: CredentialIssuanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CredentialIssuanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
