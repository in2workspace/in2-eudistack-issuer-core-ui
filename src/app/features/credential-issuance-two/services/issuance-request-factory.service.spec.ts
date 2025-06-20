import { TestBed } from '@angular/core/testing';

import { IssuanceRequestFactoryService } from './issuance-request-factory.service';

describe('IssuanceRequestFactoryService', () => {
  let service: IssuanceRequestFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssuanceRequestFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
