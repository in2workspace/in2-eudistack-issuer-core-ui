import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CredentialManagementComponent } from './credential-management.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LifeCycleStatusService } from 'src/app/shared/services/life-cycle-status.service';
import { CredentialProcedureWithClass } from 'src/app/core/models/entity/lear-credential-management';
import { CredentialProceduresResponse, CredentialProcedure } from 'src/app/core/models/dto/credential-procedures-response.dto';
import { ElementRef } from '@angular/core';

// helper to mock search input
 function createMockInput(initialValue = '') {
    const el = document.createElement('input');
    el.value = initialValue;
    const focusSpy = jest.spyOn(el, 'focus').mockImplementation(() => {});
    const selectSpy = jest.spyOn(el, 'select').mockImplementation(() => {});
    return { el, focusSpy, selectSpy };
  }

describe('CredentialManagementComponent', () => {
  let component: CredentialManagementComponent;
  let fixture: ComponentFixture<CredentialManagementComponent>;
  let credentialProcedureService: CredentialProcedureService;
  let credentialProcedureSpy: jest.SpyInstance;
  let authService: jest.Mocked<any>;
  let router: Router;
  let statusService: LifeCycleStatusService;

  beforeEach(async () => {
    authService = {
      getMandator: () => of(null),
      getEmailName: () => of('User Name'),
      getName: () => of('Name'),
      getToken: () => of('token'),
      logout: () => of(void 0),
      hasPower: () => true,
      hasIn2OrganizationIdentifier: jest.fn().mockReturnValue(true),
    } as jest.Mocked<any>;

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({}),
        CredentialManagementComponent,
      ],
      providers: [
        CredentialProcedureService,
        TranslateService,
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
        provideHttpClient()
      ],
    }).compileComponents();

    credentialProcedureService = TestBed.inject(CredentialProcedureService);
    credentialProcedureSpy = jest.spyOn(credentialProcedureService, 'getCredentialProcedures');
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    statusService = TestBed.inject(LifeCycleStatusService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CredentialManagementComponent);
    component = fixture.componentInstance;
    // perquè no dongui error en ngOnInit
    credentialProcedureSpy.mockReturnValue(of({ credential_procedures: [] } as CredentialProceduresResponse));
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.resetAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call hasIn2OrganizationIdentifier on ngOnInit', () => {
    component.ngOnInit();
    expect(authService.hasIn2OrganizationIdentifier).toHaveBeenCalled();
    expect(component.isValidOrganizationIdentifier).toBe(true);
  });

  it('should call loadCredentialData on ngOnInit', () => {
    const loadSpy = jest.spyOn(component, 'loadCredentialData');
    component.ngOnInit();
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should set dataSource filter and reset paginator on search', fakeAsync(() => {
    // assignem un paginator real per a que firstPage existeixi
    component.dataSource['_paginator'] = { firstPage: jest.fn() } as any;
    const paginatorSpy = jest.spyOn(component.dataSource.paginator!, 'firstPage');

    component['searchSubject'].next('FOO');
    tick(500);

    expect(component.dataSource.filter).toBe('foo');
    expect(paginatorSpy).toHaveBeenCalled();
  }));

  it('should set dataSource filter and not reset paginator if paginator is undefined', fakeAsync(() => {
    // forcem paginator undefined
    jest.spyOn(component.dataSource, 'paginator', 'get').mockReturnValue(null);
    const paginator = component.dataSource.paginator;
    component['searchSubject'].next('BAR');
    tick(500);

    expect(component.dataSource.filter).toBe('bar');
    // no ha de saltar cap error ni cridar firstPage
    expect(paginator).toBeNull();
  }));

  it('should assign paginator and sort to dataSource', () => {
    const mockPaginator = {} as any;
    const mockSort = {} as any;
    component.paginator = mockPaginator;
    component.sort = mockSort;
    component.ngAfterViewInit();
    expect(component.dataSource.paginator).toBe(mockPaginator);
    expect(component.dataSource.sort).toBe(mockSort);
  });

  it('should configure sortingDataAccessor correctly', () => {
    component.ngAfterViewInit();
    const mockItem: any = {
      credential_procedure: {
        procedure_id: 'id-proc',
        status: 'WITHDRAWN',
        subject: 'Subject Test',
        updated: '2024-10-20',
        credential_type: 'Type Test',
      },
    };
    expect(component.dataSource.sortingDataAccessor(mockItem, 'status')).toBe('draft');
    expect(component.dataSource.sortingDataAccessor(mockItem, 'subject')).toBe('subject test');
    expect(component.dataSource.sortingDataAccessor(mockItem, 'updated')).toBe('2024-10-20');
    expect(component.dataSource.sortingDataAccessor(mockItem, 'credential_type')).toBe('type test');
    expect(component.dataSource.sortingDataAccessor(mockItem, 'unknown')).toBe('');
  });

  it('should configure filterPredicate correctly', () => {
    component.ngAfterViewInit();
    const mockItem: any = {
      credential_procedure: { subject: 'My Fancy Subject' }
    };
    // coincideix
    expect(component.dataSource.filterPredicate!(mockItem, 'fancy')).toBe(true);
    // no coincideix
    expect(component.dataSource.filterPredicate!(mockItem, 'xyz')).toBe(false);
  });

  it('should call searchSubject.next with the correct filter value', () => {
    const event = { target: { value: 'searchTerm'} } as any;
    const nextSpy = jest.spyOn(component['searchSubject'], 'next');
    component.applyFilter(event);
    expect(nextSpy).toHaveBeenCalledWith('searchTerm');
  });

 it('should focus and select input when opening the search bar', () => {
    component.hideSearchBar = true;

    const { el, focusSpy, selectSpy } = createMockInput();
    component.searchInput = new ElementRef<HTMLInputElement>(el);

    component.toggleSearchBar();

    expect(component.hideSearchBar).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
    expect(selectSpy).toHaveBeenCalled();
  });

  it('should clear value, push empty filter, and go to first page when closing the search bar', () => {
    component.hideSearchBar = false;

    const { el } = createMockInput('lorem');
    component.searchInput = new ElementRef<HTMLInputElement>(el);

    component.dataSource['_paginator'] = { firstPage: jest.fn() } as any;
    const firstPageSpy = jest.spyOn(component.dataSource.paginator!, 'firstPage');


    const nextSpy = jest.spyOn(component['searchSubject'], 'next');
    component.toggleSearchBar();

    expect(component.hideSearchBar).toBe(true);
    expect(el.value).toBe('');
    expect(nextSpy).toHaveBeenCalledWith('');
    expect(firstPageSpy).toHaveBeenCalled(); 
  });

  it('should toggle searchbar', () => {
    component.hideSearchBar = true;

    component.toggleSearchBar();
    expect(component.hideSearchBar).toBeFalsy();

    component.toggleSearchBar();
    expect(component.hideSearchBar).toBeTruthy(); // <-- arreglat
  });

  it('should load credential data and update dataSource', fakeAsync(() => {
    const mockProc: CredentialProcedure = {
      credential_procedure: {
        procedure_id: 'id1',
        subject: 'S1',
        status: 'DRAFT',
        updated: '2025-07-01',
        credential_type: 'LEAR_CREDENTIAL_EMPLOYEE',
      }
    };
    const mockResponse = { credential_procedures: [ mockProc ] } as CredentialProceduresResponse;
    credentialProcedureSpy.mockReturnValue(of(mockResponse));
    const withClass: CredentialProcedureWithClass[] = [
      { ...mockProc, statusClass: 'status-active' }
    ];
    const statusSpy = jest.spyOn(statusService, 'addStatusClass').mockReturnValue(withClass);

    component.loadCredentialData();
    tick();
    expect(credentialProcedureSpy).toHaveBeenCalled();
    expect(statusSpy).toHaveBeenCalledWith(mockResponse.credential_procedures);
    expect(component.dataSource.data).toEqual(withClass);
  }));

  it('should log an error if getCredentialProcedures fails', fakeAsync(() => {
    const error = new Error('oops');
    credentialProcedureSpy.mockReturnValue(throwError(() => error));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    component.loadCredentialData();
    tick();

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching credentials for table', error);
    consoleSpy.mockRestore();
  }));
});