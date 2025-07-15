// src/app/features/credential-details/credential-details.component.spec.ts
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoaderService } from 'src/app/core/services/loader.service';
import { CredentialDetailsService } from './services/credential-details.service';
import { CredentialDetailsComponent } from './credential-details.component';
import { CredentialProcedureDataDetails, CredentialStatus, CredentialType, LEARCredential, LifeCycleStatus } from 'src/app/core/models/entity/lear-credential';
import { MappedExtendedDetailsField } from 'src/app/core/models/entity/lear-credential-details';
import { StatusClass } from 'src/app/core/models/entity/lear-credential-management';
import { mockCredentialStatus } from 'src/app/core/mocks/details.mock';

describe('CredentialDetailsComponent', () => {
  let fixture: ComponentFixture<CredentialDetailsComponent>;
  let component: CredentialDetailsComponent;
  let mockDetailsService: {
  // CREDENTIAL DATA
  procedureId$: ReturnType<typeof signal<string>>;
  credentialDetailsData$: ReturnType<typeof signal<CredentialProcedureDataDetails | undefined>>;
  lifeCycleStatus$: ReturnType<typeof computed<LifeCycleStatus | undefined>>;
  credential$: ReturnType<typeof computed<LEARCredential | undefined>>;
  credentialValidFrom$: ReturnType<typeof computed<string>>;
  credentialValidUntil$: ReturnType<typeof computed<string>>;
  credentialType$: ReturnType<typeof computed<CredentialType | undefined>>;
  lifeCycleStatusClass$: ReturnType<typeof computed<StatusClass | undefined>>;
  credentialStatus$: ReturnType<typeof computed<CredentialStatus | undefined>>;

  // MODELS
  mainTemplateModel$: ReturnType<typeof signal<MappedExtendedDetailsField[] | undefined>>;
  sideTemplateModel$: ReturnType<typeof signal<MappedExtendedDetailsField[] | undefined>>;
  showSideTemplateCard$: ReturnType<typeof computed<boolean>>;

  // BUTTONS
  showReminderButton$: ReturnType<typeof computed<boolean>>;
  showSignCredentialButton$: ReturnType<typeof computed<boolean>>;
  showRevokeCredentialButton$: ReturnType<typeof computed<boolean>>;
  enableRevokeCredentialButton$: ReturnType<typeof computed<boolean>>;
  showActionsButtonsContainer$: ReturnType<typeof computed<boolean>>;

  // METHODS
  setProcedureId: jest.Mock;
  loadCredentialModels: jest.Mock;
  openSendReminderDialog: jest.Mock;
  openSignCredentialDialog: jest.Mock;
}
  let mockLoader: { isLoading$: Observable<boolean> };

  beforeEach(async () => {
    const validFrom$ = signal('2025-01-01');
    const validUntil$ = signal('2025-12-31');
    const type$ = signal<CredentialType | undefined>('LEARCredentialEmployee');
    const lifeCycleStatus$ = signal<LifeCycleStatus | undefined>('PEND_DOWNLOAD');
    const mainModel$ = signal<MappedExtendedDetailsField[] | undefined>([{ key: 'foo', type: 'key-value', value: 'bar' }]);
    const sideModel$ = signal<MappedExtendedDetailsField[] | undefined>([]);
    // Afegim al mock les noves signals i computed
    const credential$ = signal<any>({
      validFrom: '2025-01-01',
      validUntil: '2025-12-31',
      credentialStatus: 'ACTIVE',
    });
    const procedureId$ = signal<string>('the-id');

    const lifeCycleStatusClass$ = signal<any>('status-success'); // o el valor esperat del mapStatusToClass
    const showSideTemplateCard$ = signal<boolean>(false);
    const showReminderButton$ = signal<boolean>(true);
    const showSignCredentialButton$ = signal<boolean>(true);
    const showRevokeCredentialButton$ = signal<boolean>(false);
    const enableRevokeCredentialButton$ = signal<boolean>(true);
    const showActionsButtonsContainer$ = signal<boolean>(true);
    const credentialStatus$ = signal(mockCredentialStatus);


    mockDetailsService = {
      procedureId$: procedureId$,
      credentialDetailsData$: signal(undefined), // o valor simulat
      lifeCycleStatus$: lifeCycleStatus$,
      credential$: credential$,
      credentialValidFrom$: validFrom$,
      credentialValidUntil$: validUntil$,
      credentialType$: type$,
      credentialStatus$: credentialStatus$,
      mainTemplateModel$: mainModel$,
      sideTemplateModel$: sideModel$,
      showSideTemplateCard$: showSideTemplateCard$,
      showReminderButton$: showReminderButton$,
      showSignCredentialButton$: showSignCredentialButton$,
      showRevokeCredentialButton$: showRevokeCredentialButton$,
      enableRevokeCredentialButton$: enableRevokeCredentialButton$,
      showActionsButtonsContainer$: showActionsButtonsContainer$,
      lifeCycleStatusClass$: lifeCycleStatusClass$,
      setProcedureId: jest.fn(),
      loadCredentialModels: jest.fn(),
      openSendReminderDialog: jest.fn(),
      openSignCredentialDialog: jest.fn(),
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

  // todo complete
  it('creates component and initializes signals', () => {
    expect(component).toBeTruthy();
    expect(component.credentialValidFrom$()).toBe('2025-01-01');
    expect(component.credentialValidUntil$()).toBe('2025-12-31');
    expect(component.credentialType$()).toBe('LEARCredentialEmployee');
    expect(component.lifeCycleStatus$()).toBe('PEND_DOWNLOAD');
    expect(component.credentialStatus$()).toEqual(mockCredentialStatus);
    expect(component.mainTemplateModel$()![0].key).toBe('foo');
    expect(component.sideTemplateModel$()).toEqual([]);
  });

  it('subscribes to loader.isLoading$', done => {
    component.isLoading$.subscribe(v => {
      expect(v).toBe(true);
      done();
    });
  });

  it('ngOnInit calls setProcedureId and loadCredentialModels', () => {
    expect(mockDetailsService.setProcedureId).toHaveBeenCalledWith('the-id');
    expect(mockDetailsService.loadCredentialModels)
      .toHaveBeenCalledWith((component as any).injector);
  });

  // describe('computed signals', () => {
  //   beforeEach(() => {
  //     jest.spyOn(actionHelpers, 'statusHasSendReminderlButton').mockReturnValue(true);
  //     jest.spyOn(actionHelpers, 'credentialTypeHasSendReminderButton').mockReturnValue(true);
  //     jest.spyOn(actionHelpers, 'statusHasSignCredentialButton').mockReturnValue(true);
  //     jest.spyOn(actionHelpers, 'credentialTypeHasSignCredentialButton').mockReturnValue(true);
  //   });

  //   it('showSideTemplateCard$ is false when sideTemplateModel is empty', () => {
  //     expect(component.showSideTemplateCard$()).toBe(false);
  //   });

  //   it('showSideTemplateCard$ becomes true when sideTemplateModel is non-empty', () => {
  //     mockDetailsService.sideTemplateModel$.set([{ key: 'x', type: 'key-value', value: 'y' }]);
  //     expect(component.showSideTemplateCard$()).toBe(true);
  //   });


  //   it('showSignCredentialButton$ reacts to helper functions and type signal', () => {
  //     expect(component.showSignCredentialButton$()).toBe(true);
  //     (actionHelpers.credentialTypeHasSignCredentialButton as jest.Mock).mockReturnValue(false);
     
  //     mockDetailsService.credentialType$.set(undefined);
  //     mockDetailsService.credentialType$.set('LearCredentialEmployee');

  //     expect(component.showSignCredentialButton$()).toBe(false);
  //   });
  // });

  describe('button actions', () => {
    it('openSendReminderDialog calls service method', () => {
      component.openSendReminderDialog();
      expect(mockDetailsService.openSendReminderDialog).toHaveBeenCalled();
    });

    it('openSignCredentialDialog calls service method', () => {
      component.openSignCredentialDialog();
      expect(mockDetailsService.openSignCredentialDialog).toHaveBeenCalled();
    });
  });
});
