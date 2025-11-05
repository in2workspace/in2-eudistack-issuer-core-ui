import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoaderService } from 'src/app/shared/services/loader.service';
import { CredentialDetailsService } from './services/credential-details.service';
import { CredentialDetailsComponent } from './credential-details.component';
import { EvaluatedExtendedDetailsField } from 'src/app/core/models/entity/lear-credential-details';
import { mockCredentialStatus } from 'src/app/core/mocks/details.mock';
import { CredentialType, LifeCycleStatus } from 'src/app/core/models/entity/lear-credential';
import { StatusClass } from 'src/app/core/models/entity/lear-credential-management';

describe('CredentialDetailsComponent', () => {
  let fixture: ComponentFixture<CredentialDetailsComponent>;
  let component: CredentialDetailsComponent;
  let mockDetailsService: {
    procedureId$: ReturnType<typeof signal<string>>;
    credentialProcedureDetails$: ReturnType<typeof signal<any>>;
    lifeCycleStatus$: ReturnType<typeof signal<LifeCycleStatus | undefined>>;
    credentialValidFrom$: ReturnType<typeof signal<string>>;
    credentialValidUntil$: ReturnType<typeof signal<string>>;
    credentialType$: ReturnType<typeof signal<CredentialType | undefined>>;
    credentialStatus$: ReturnType<typeof signal<any>>;
    lifeCycleStatusClass$: ReturnType<typeof signal<StatusClass | undefined>>;
    email$: ReturnType<typeof signal<any>>;

    mainViewModel$: ReturnType<typeof signal<EvaluatedExtendedDetailsField[] | undefined>>;
    sideViewModel$: ReturnType<typeof signal<EvaluatedExtendedDetailsField[] | undefined>>;
    showSideTemplateCard$: ReturnType<typeof signal<boolean>>;

    showReminderButton$: ReturnType<typeof signal<boolean>>;
    showSignCredentialButton$: ReturnType<typeof signal<boolean>>;
    showRevokeCredentialButton$: ReturnType<typeof signal<boolean>>;
    enableRevokeCredentialButton$: ReturnType<typeof signal<boolean>>;
    showActionsButtonsContainer$: ReturnType<typeof signal<boolean>>;

    setProcedureId: jest.Mock;
    loadCredentialModels: jest.Mock;
    openSendReminderDialog: jest.Mock;
    openSignCredentialDialog: jest.Mock;
    openRevokeCredentialDialog: jest.Mock;
  };
  let mockLoader: { isLoading$: Observable<boolean> };

  beforeEach(async () => {
    const validFrom$ = signal('2025-01-01');
    const validUntil$ = signal('2025-12-31');
    const type$ = signal<CredentialType | undefined>('LEARCredentialEmployee');
    const lifecycle$ = signal<LifeCycleStatus | undefined>('EXPIRED');
    const statusClass$ = signal<StatusClass | undefined>('status-expired');
    const mainModel$ = signal<EvaluatedExtendedDetailsField[] | undefined>([{ key: 'foo', type: 'key-value', value: 'bar' }]);
    const sideModel$ = signal<EvaluatedExtendedDetailsField[] | undefined>([]);
    const showSide$ = signal<boolean>(false);
    const showRem$ = signal<boolean>(true);
    const showSign$ = signal<boolean>(true);
    const showRev$ = signal<boolean>(false);
    const enableRev$ = signal<boolean>(true);
    const showActions$ = signal<boolean>(true);
    const credentialStatus$ = signal(mockCredentialStatus);
    const procedureId$ = signal<string>('the-id');
    const email$ = signal<string>('subject@email.com');

    mockDetailsService = {
      procedureId$,
      credentialProcedureDetails$: signal(undefined),
      lifeCycleStatus$: lifecycle$,
      credentialValidFrom$: validFrom$,
      credentialValidUntil$: validUntil$,
      credentialType$: type$,
      credentialStatus$: credentialStatus$,
      lifeCycleStatusClass$: statusClass$,
      email$: email$,

      mainViewModel$: mainModel$,
      sideViewModel$: sideModel$,
      showSideTemplateCard$: showSide$,

      showReminderButton$: showRem$,
      showSignCredentialButton$: showSign$,
      showRevokeCredentialButton$: showRev$,
      enableRevokeCredentialButton$: enableRev$,
      showActionsButtonsContainer$: showActions$,

      setProcedureId: jest.fn(),
      loadCredentialModels: jest.fn(),
      openSendReminderDialog: jest.fn(),
      openSignCredentialDialog: jest.fn(),
      openRevokeCredentialDialog: jest.fn(),
    };

    mockLoader = { isLoading$: of(true) };

    const fakeActivatedRoute = {
      snapshot: { paramMap: { get: (_: string) => 'the-id' } }
    };

    await TestBed.configureTestingModule({
      imports: [
        CredentialDetailsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: fakeActivatedRoute }
      ]
    })
    .overrideComponent(CredentialDetailsComponent, {
      set: {
        providers: [
          { provide: CredentialDetailsService, useValue: mockDetailsService },
          { provide: LoaderService, useValue: mockLoader }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredentialDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component and initializes signals', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize main signals correctly', () => {
    expect(component.credentialValidFrom$()).toBe('2025-01-01');
    expect(component.credentialValidUntil$()).toBe('2025-12-31');
    expect(component.credentialType$()).toBe('LEARCredentialEmployee');
    expect(component.lifeCycleStatus$()).toBe('EXPIRED');
    expect(component.credentialStatus$()).toEqual(mockCredentialStatus);
    expect(component.email$()).toEqual('subject@email.com');
    expect(component.mainViewModel$()![0].key).toBe('foo');
    expect(component.sideViewModel$()).toEqual([]);
  });

  it('should subscribe to loader.isLoading$', done => {
    component.isLoading$.subscribe(v => {
      expect(v).toBe(true);
      done();
    });
  });

  it('should call setProcedureId and loadCredentialModels on ngOnInit', () => {
    expect(mockDetailsService.setProcedureId).toHaveBeenCalledWith('the-id');
    expect(mockDetailsService.loadCredentialModels)
      .toHaveBeenCalledWith((component as any).injector);
  });

  describe('button signal bindings', () => {
    it('should reflect the service state', () => {
      expect(component.showReminderButton$()).toBe(true);
      expect(component.showSignCredentialButton$()).toBe(true);
      expect(component.showRevokeCredentialButton$()).toBe(false);
      expect(component.enableRevokeCredentialButton$()).toBe(true);
      expect(component.showActionsButtonsContainer$()).toBe(true);
      expect(component.showSideTemplateCard$()).toBe(false);
    });
  });

  describe('button action methods', () => {
    it('should call openSendReminderDialog on service', () => {
      component.openSendReminderDialog();
      expect(mockDetailsService.openSendReminderDialog).toHaveBeenCalled();
    });

    it('should call openSignCredentialDialog on service', () => {
      component.openSignCredentialDialog();
      expect(mockDetailsService.openSignCredentialDialog).toHaveBeenCalled();
    });

    it('should call openRevokeCredentialDialog on service', () => {
      component.openRevokeCredentialDialog();
      expect(mockDetailsService.openRevokeCredentialDialog).toHaveBeenCalled();
    });
  });
});
