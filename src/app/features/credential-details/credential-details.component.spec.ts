import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CredentialDetailsComponent } from './credential-details.component';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { CredentialDetailsService } from './services/credential-details.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { signal } from '@angular/core';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { mockCredentialEmployee } from 'src/app/core/mocks/details-mocks';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LifeCycleStatus, CredentialType, CredentialStatus } from 'src/app/core/models/entity/lear-credential';
import { StatusClass } from 'src/app/core/models/entity/lear-credential-management';

describe('CredentialDetailsComponent', () => {
  let component: CredentialDetailsComponent;
  let fixture: ComponentFixture<CredentialDetailsComponent>;

  const mockDetailsService = {
    credentialValidFrom$: signal('2023-01-01'),
    credentialValidUntil$: signal('2023-12-31'),
    credentialType$: signal<CredentialType>('LEARCredentialEmployee'),
    lifeCycleStatus$: signal<LifeCycleStatus>('DRAFT'),
    credentialStatus$: signal<CredentialStatus>({} as any),
    lifeCycleStatusClass$: signal<LifeCycleStatus|undefined>(undefined)
,   credentialDetailsForm$: signal(new FormGroup({})),
    credentialDetailsFormSchema$: signal({}),
    setProcedureId: jest.fn(),
    loadCredentialDetailsAndForm: jest.fn(),
    openSendReminderDialog: jest.fn(),
    openSignCredentialDialog: jest.fn(),
  };

  const mockLoaderService = {
    isLoading$: of(false),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn(() => '123'),
      },
    },
  };

  const mockCredentialProcedureService = {
    getCredentialProcedureById: jest.fn().mockReturnValue(of(mockCredentialEmployee)),
    signCredential: jest.fn(),
    sendReminder: jest.fn(),
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialDetailsComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: CredentialDetailsService, useValue: mockDetailsService },
        { provide: CredentialProcedureService, useValue: mockCredentialProcedureService },
        { provide: HttpClient, useValue: {} },
        { provide: LoaderService, useValue: mockLoaderService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    TestBed.overrideProvider(CredentialDetailsService, { useValue: mockDetailsService });
    fixture = TestBed.createComponent(CredentialDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show reminder button', () => {
    mockDetailsService.lifeCycleStatus$.set('WITHDRAWN');
    mockDetailsService.credentialType$.set('LEARCredentialEmployee');
    expect(component.showReminderButton$()).toBe(true);

    mockDetailsService.lifeCycleStatus$.set('WITHDRAWN');
    mockDetailsService.credentialType$.set('LEARCredentialMachine');
    expect(component.showReminderButton$()).toBe(false);

    mockDetailsService.lifeCycleStatus$.set('DRAFT');
    mockDetailsService.credentialType$.set('LEARCredentialEmployee');
    expect(component.showReminderButton$()).toBe(true);

    mockDetailsService.lifeCycleStatus$.set('WITHDRAWN');
    mockDetailsService.credentialType$.set('VerifiableCertification');
    expect(component.showReminderButton$()).toBe(false);

    mockDetailsService.lifeCycleStatus$.set('VALID');
    mockDetailsService.credentialType$.set('LEARCredentialEmployee');
    expect(component.showReminderButton$()).toBe(false);

    mockDetailsService.lifeCycleStatus$.set('VALID');
    mockDetailsService.credentialType$.set('LEARCredentialMachine');
    expect(component.showReminderButton$()).toBe(false);

    mockDetailsService.lifeCycleStatus$.set('VALID');
    mockDetailsService.credentialType$.set('VerifiableCertification');
    expect(component.showReminderButton$()).toBe(false);

  });

  it('should show sign credential button', () => {
    // Cas positiu: status i type correctes
    mockDetailsService.lifeCycleStatus$.set('PEND_SIGNATURE');
    mockDetailsService.credentialType$.set('LEARCredentialEmployee');
    expect(component.showSignCredentialButton$()).toBe(true);
  
    mockDetailsService.lifeCycleStatus$.set('PEND_SIGNATURE');
    mockDetailsService.credentialType$.set('VerifiableCertification');
    expect(component.showSignCredentialButton$()).toBe(true);
  
    // Casos negatius: status o type incorrectes
    mockDetailsService.lifeCycleStatus$.set('PEND_SIGNATURE');
    mockDetailsService.credentialType$.set('LEARCredentialMachine');
    expect(component.showSignCredentialButton$()).toBe(false);
  
    mockDetailsService.lifeCycleStatus$.set('DRAFT');
    mockDetailsService.credentialType$.set('LEARCredentialEmployee');
    expect(component.showSignCredentialButton$()).toBe(false);
  
    mockDetailsService.lifeCycleStatus$.set('DRAFT');
    mockDetailsService.credentialType$.set('LEARCredentialMachine');
    expect(component.showSignCredentialButton$()).toBe(false);
  
    mockDetailsService.lifeCycleStatus$.set('VALID');
    mockDetailsService.credentialType$.set('VerifiableCertification');
    expect(component.showSignCredentialButton$()).toBe(false);
  });
  

  it('should call getProcedureId and initializeForm on ngOnInit', () => {
    const getProcedureIdSpy = jest.spyOn(component as any, 'getProcedureId');
    const initializeFormSpy = jest.spyOn(component as any, 'initializeForm');
  
    component.ngOnInit();
  
    expect(getProcedureIdSpy).toHaveBeenCalled();
    expect(initializeFormSpy).toHaveBeenCalled();
  });

  it('should call detailsService.loadCredentialDetailsAndForm in loadCredentialDetailsAndForm()', () => {
    const spy = jest.spyOn(mockDetailsService, 'loadCredentialDetailsAndForm');
  
    // Accés a mètode privat via cast
    (component as any).loadCredentialDetailsAndForm();
  
    expect(spy).toHaveBeenCalled();
  });
  
  it('should call loadCredentialDetailsAndForm in initializeForm()', () => {
    const spy = jest.spyOn(component as any, 'loadCredentialDetailsAndForm');
  
    (component as any).initializeForm();
  
    expect(spy).toHaveBeenCalled();
  });
  
  it('should call detailsService.openSendReminderDialog when openSendReminderDialog is called', () => {
    const spy = jest.spyOn(mockDetailsService, 'openSendReminderDialog');
  
    component.openSendReminderDialog();
  
    expect(spy).toHaveBeenCalled();
  });
  
  it('should call detailsService.openSignCredentialDialog when openSignCredentialDialog is called', () => {
    const spy = jest.spyOn(mockDetailsService, 'openSignCredentialDialog');
  
    component.openSignCredentialDialog();
  
    expect(spy).toHaveBeenCalled();
  });
  
  it('should return form control keys from a FormGroup', () => {
    const testGroup = new FormGroup({
      name: new FormControl(''),
      age: new FormControl(''),
      email: new FormControl('')
    });
  
    const result = component.formKeys(testGroup);
  
    expect(result).toEqual(['name', 'age', 'email']);
  });

  it('should return the correct control type', () => {
    const cases = [
      { control: new FormGroup({ name: new FormControl('') }), expected: 'group' },
      { control: new FormControl(''), expected: 'control' },
    ] as const;
  
    for (const { control, expected } of cases) {
      const result = component.getControlType(control);
      expect(result).toBe(expected);
    }
  });
  
  
  it('should cast control to FormArray', () => {
    const formArray = new FormArray([
      new FormControl('one'),
      new FormControl('two')
    ]);
  
    const result = component.asFormArray(formArray);
    expect(result).toBe(formArray); // mateixa referència
    expect(result.controls.length).toBe(2); // comportament típic de FormArray
  });
  

  
});
