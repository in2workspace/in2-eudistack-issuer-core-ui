import { TestBed } from '@angular/core/testing';
import { CredentialIssuanceService } from './credential-issuance.service';
import { IssuanceRequestFactoryService } from './issuance-request-factory.service';
import { CountryService } from 'src/app/core/services/country.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';


describe('CredentialIssuanceService', () => {
  let service: CredentialIssuanceService;
  let mockAuthService: { hasIn2OrganizationIdentifier: jest.Mock };
  let mockProcedureService: { createProcedure: jest.Mock };

  beforeEach(() => {
    mockAuthService = {
      hasIn2OrganizationIdentifier: jest.fn().mockReturnValue(true),
    };
    mockProcedureService = { createProcedure: jest.fn() }

    TestBed.configureTestingModule({
      imports: [],
      providers: [IssuanceRequestFactoryService, CountryService, { provide: AuthService, useValue: mockAuthService }, 
        { provide: CredentialProcedureService, useValue: mockProcedureService }
      ]
    });
    service = TestBed.inject(CredentialIssuanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
