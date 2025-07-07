import { TestBed } from '@angular/core/testing';

import { CredentialActionsService } from './credential-actions.service';

describe('CredentialActionsService', () => {
  let service: CredentialActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CredentialActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
