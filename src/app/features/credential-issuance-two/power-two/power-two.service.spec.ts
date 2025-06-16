import { TestBed } from '@angular/core/testing';

import { PowerTwoService } from './power-two.service';

describe('PowerTwoService', () => {
  let service: PowerTwoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PowerTwoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
