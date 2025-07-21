import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CredentialManagementComponent } from './credential-management.component';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthModule } from 'angular-auth-oidc-client';
import { By } from '@angular/platform-browser';
import { CredentialProcedure} from 'src/app/core/models/dto/procedure-response.dto';
import { credentialProcedureListMock } from 'src/app/core/mocks/credential-procedure-list.mock';
import { MatSort } from '@angular/material/sort';
import { ElementRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('CredentialManagementComponent', () => {
  let component: CredentialManagementComponent;
  let fixture: ComponentFixture<CredentialManagementComponent>;
  let credentialProcedureService: CredentialProcedureService;
  let credentialProcedureSpy: jest.SpyInstance;
  let authService: jest.Mocked<any>;
  let router: Router;

  beforeEach(async () => {
    authService = {
      getMandator:()=> of(null),
      getEmailName() {
        return of('User Name');
      },
      getName(){
        return of('Name')
      },
      getToken(){
        return of('token')
      },
      logout() {
        return of(void 0);
      },
      hasPower: () => true,
      hasIn2OrganizationIdentifier: jest.fn().mockReturnValue(true)
    } as jest.Mocked<any>

    await TestBed.configureTestingModule({
    imports: [NoopAnimationsModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({}),
        AuthModule.forRoot({ config: {} }),
        CredentialManagementComponent],
    providers: [
        CredentialProcedureService,
        Router,
        TranslateService,
        { provide: AuthService, useValue: authService },
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    paramMap: {
                        get: () => '1',
                    },
                },
            },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    credentialProcedureService = TestBed.inject(
      CredentialProcedureService
    );
    credentialProcedureSpy = jest.spyOn(credentialProcedureService, 'getCredentialProcedures');
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CredentialManagementComponent);
    component = fixture.componentInstance;

    credentialProcedureSpy.mockReturnValue(of());

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.resetAllMocks();
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
    const loadCredentialDataSpy = jest.spyOn(component, 'loadCredentialData');
    component.ngOnInit();
    expect(loadCredentialDataSpy).toHaveBeenCalled();
  });

  it('should set dataSource filter and reset paginator on search', fakeAsync(() => {
    const paginatorSpy = jest.spyOn(component.dataSource['_paginator'], 'firstPage');

    const searchValue = 'test search';
    component['searchSubject'].next(searchValue);

    tick(500);

    expect(component.dataSource.filter).toBe(searchValue.trim().toLowerCase());
    expect(paginatorSpy).toHaveBeenCalled();
  }));

  it('should set data sorting accessor', ()=>{
    component.ngAfterViewInit();
    const item = {
      credential_procedure: {
        procedure_id: 'Id',
        subject: 'Name',
        status: 'Status',
        updated: 'Updated',
        credential_type: 'Type'
      }
    } as any;
    const resStatus = component.dataSource.sortingDataAccessor(item, 'status');
    expect(resStatus).toBe(item.credential_procedure.status.toLowerCase());

    const resName = component.dataSource.sortingDataAccessor(item, 'subject');
    expect(resName).toBe(item.credential_procedure.subject.toLowerCase());

    const resUpdated = component.dataSource.sortingDataAccessor(item, 'updated');
    expect(resUpdated).toBe(item.credential_procedure.updated.toLowerCase());

    const resType = component.dataSource.sortingDataAccessor(item, 'credential_type');
    expect(resType).toBe(item.credential_procedure.credential_type.toLowerCase());

    const resDefault = component.dataSource.sortingDataAccessor(item, 'random');
    expect(resDefault).toBe('');
  });

  it('should set dataSource filter and not reset paginator if paginator is undefined', fakeAsync(() => {
    component.dataSource = new MatTableDataSource<CredentialProcedure>([]);
    
    // Mock del paginator com null
    jest.spyOn(component.dataSource, 'paginator', 'get').mockReturnValue(null);
  
    const searchValue = 'test search';
    component['searchSubject'].next(searchValue);
  
    tick(500);
  
    // Comprova que el filtre es configura correctament
    expect(component.dataSource.filter).toBe(searchValue.trim().toLowerCase());
  
    // Comprova que no es crida firstPage
    const firstPageSpy = jest.fn();
    expect(firstPageSpy).not.toHaveBeenCalled();
  }));
  
  

it('should set dataSource filter and reset paginator if paginator is defined', fakeAsync(() => {
  // Espiar el mètode firstPage del paginator
  const paginatorSpy = jest.spyOn(component.dataSource['_paginator'], 'firstPage');

  // Simular un valor de cerca
  const searchValue = 'test search';
  component['searchSubject'].next(searchValue);

  // Esperar al debounceTime
  tick(500);

  // Comprovar que el filtre s'ha configurat correctament
  expect(component.dataSource.filter).toBe(searchValue.trim().toLowerCase());

  // Comprovar que s'ha cridat a firstPage
  expect(paginatorSpy).toHaveBeenCalled();
}));

it('should assign paginator and sort to dataSource', () => {
  // Mock del paginator i sort
  const mockPaginator = {} as MatPaginator;
  const mockSort = {} as MatSort;

  // Assignar els mocks al component
  component.paginator = mockPaginator;
  component.sort = mockSort;

  // Executar el mètode
  component.ngAfterViewInit();

  // Assert per comprovar que paginator i sort estan assignats correctament
  expect(component.dataSource.paginator).toBe(mockPaginator);
  expect(component.dataSource.sort).toBe(mockSort);
});

it('should configure sortingDataAccessor correctly', () => {
  // Configurar un element de prova
  const mockItem: CredentialProcedure = {
    credential_procedure: {
      procedure_id: 'id-proc',
      status: 'WITHDRAWN',
      subject: 'Subject Test',
      updated: '2024-10-20',
      credential_type: 'Type Test',
    },
  };

  // Executar el mètode
  component.ngAfterViewInit();

  // Accedir al sortingDataAccessor i provar diferents propietats
  expect(component.dataSource.sortingDataAccessor(mockItem, 'status')).toBe('draft');
  expect(component.dataSource.sortingDataAccessor(mockItem, 'subject')).toBe('subject test');
  expect(component.dataSource.sortingDataAccessor(mockItem, 'updated')).toBe('2024-10-20');
  expect(component.dataSource.sortingDataAccessor(mockItem, 'credential_type')).toBe('type test');
  expect(component.dataSource.sortingDataAccessor(mockItem, 'unknown')).toBe('');
});

it('should configure filterPredicate correctly', () => {
  // Configurar un element de prova
  const mockItem: CredentialProcedure = {
    credential_procedure: {
      procedure_id: 'id-proc',
      status: 'ACTIVE',
      subject: 'Test Subject',
      updated: '2024-10-20',
      credential_type: 'Type Test',
    },
  };

  // Configurar el filtre de prova
  const filter = 'test';

  // Executar el mètode
  component.ngAfterViewInit();

  // Accedir al filterPredicate i comprovar si retorna true per un filtre que coincideix
  expect(component.dataSource.filterPredicate(mockItem, filter)).toBe(true);

  // Comprovar si retorna false per un filtre que no coincideix
  expect(component.dataSource.filterPredicate(mockItem, 'nomatch')).toBe(false);
});


it('should call searchSubject.next with the correct filter value', () => {
  // Mock del Event amb un valor d'entrada
  const event = {
    target: { value: 'search term' } as HTMLInputElement,
  } as any;

  // Mock del BehaviorSubject o Subject si s'ha d'espionatge
  const searchSubjectSpy = jest.spyOn(component['searchSubject'], 'next');

  // Executar el mètode
  component.applyFilter(event);

  // Assert per comprovar que s'ha cridat el next amb el valor correcte
  expect(searchSubjectSpy).toHaveBeenCalledWith('search term');
});

it('should load credential data and update dataSource', () => {
  // Mock de dades de resposta del servei
  const mockResponse = {
    credential_procedures: [credentialProcedureListMock],
  } as any;

  // Mock del servei perquè retorni la resposta simulada
  const serviceSpy = jest
    .spyOn(credentialProcedureService, 'getCredentialProcedures')
    .mockReturnValue(of(mockResponse));

  // Executar el mètode
  component.loadCredentialData();

  // Assert per comprovar que el servei ha estat cridat
  expect(serviceSpy).toHaveBeenCalled();

  // Assert per comprovar que el dataSource s'ha actualitzat correctament
  expect(component.dataSource.data).toEqual(mockResponse.credential_procedures);
});

it('should log an error if getCredentialProcedures fails', () => {
  // Mock de l'error
  const mockError = new Error('Service Error');

  // Mock del servei perquè retorni un error
  const serviceSpy = jest
    .spyOn(credentialProcedureService, 'getCredentialProcedures')
    .mockReturnValue(throwError(() => mockError));

  // Mock de console.error
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  // Executar el mètode
  component.loadCredentialData();

  // Assert per comprovar que el servei ha estat cridat
  expect(serviceSpy).toHaveBeenCalled();

  // Assert per comprovar que s'ha registrat l'error al console.error
  expect(consoleSpy).toHaveBeenCalledWith('Error fetching credentials', mockError);

  // Netejar el mock de console.error
  consoleSpy.mockRestore();
});


it('should navigate to /organization/credentials/create in navigateToCreateCredential', () => {
  component.navigateToCreateCredential();
  expect(router.navigate).toHaveBeenCalledWith(['/organization/credentials/create']);
});

it('should navigate to /organization/credentials/create-as-signer if isValidOrganizationIdentifier is true', () => {
  component.isValidOrganizationIdentifier = true;
  component.navigateToCreateCredentialAsSigner();
  expect(router.navigate).toHaveBeenCalledWith(['/organization/credentials/create-as-signer']);
});

it('should navigate to /organization/credentials/create if isValidOrganizationIdentifier is false', () => {
  component.isValidOrganizationIdentifier = false;
  component.navigateToCreateCredentialAsSigner();
  expect(router.navigate).toHaveBeenCalledWith(['/organization/credentials/create']);
});

it('should call navigateToCredentialDetails on onRowClick', () => {
  const row = { credential_procedure: { credential_type: 'LEAR_CREDENTIAL_EMPLOYEE', procedure_id: '123' } } as CredentialProcedure;
  const goToCredentialDetailsSpy = jest.spyOn(component, 'navigateToCredentialDetails');
  component.onRowClick(row);
  expect(goToCredentialDetailsSpy).toHaveBeenCalledWith(row);
});

it('should navigate to /organization/credentials/details/:id if credential type is LEAR_CREDENTIAL_EMPLOYEE', () => {
  const credentialProcedure = { 
    credential_procedure: { 
      credential_type: 'LEAR_CREDENTIAL_EMPLOYEE', 
      procedure_id: '123' 
    } 
  } as CredentialProcedure;

  component.navigateToCredentialDetails(credentialProcedure);
  expect(router.navigate).toHaveBeenCalledWith(['/organization/credentials/details', '123']);
});

it('should toggle searchBar and reset filters when closed', () => {
  component.dataSource.paginator = { firstPage: jest.fn() } as unknown as MatPaginator;
  
  component.searchInput = { nativeElement: { value: 'test' } } as ElementRef<HTMLInputElement>;

  const searchSubjectSpy = jest.spyOn(component['searchSubject'], 'next');

  component.hideSearchBar = true;
  component.toggleSearchBar();
  expect(component.hideSearchBar).toBe(false);

  component.toggleSearchBar();
  expect(component.hideSearchBar).toBe(true);

  expect(component.searchInput.nativeElement.value).toBe('');

  expect(searchSubjectSpy).toHaveBeenCalledWith('');

  expect(component.dataSource.paginator.firstPage).toHaveBeenCalled();
});


  //TEMPLATE
  it('should show the admin button when is valid organization id', async () => {
    component.isValidOrganizationIdentifier = true;
    fixture.detectChanges();

    await fixture.whenStable(); // Esperar que el cicle de canvi estigui complet

    const adminButton = fixture.debugElement.query(By.css("#admin-button"));
    expect(adminButton).toBeTruthy();

  });

  it('should not show the admin button when is not valid organization id', async () => {
    component.isValidOrganizationIdentifier = false;
    fixture.detectChanges();

    await fixture.whenStable(); 

    const adminButton = fixture.debugElement.query(By.css("#admin-button"));
    expect(adminButton).toBeFalsy();

  });

});
