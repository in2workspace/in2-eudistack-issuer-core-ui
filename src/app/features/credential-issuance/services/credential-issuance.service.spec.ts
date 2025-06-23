import { TestBed } from '@angular/core/testing';

import { CredentialIssuanceTwoService } from './credential-issuance.service';

describe('CredentialIssuanceTwoService', () => {
  let service: CredentialIssuanceTwoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CredentialIssuanceTwoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
