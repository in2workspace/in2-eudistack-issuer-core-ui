// src/app/features/credential-details/credential-details.component.spec.ts
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoaderService } from 'src/app/core/services/loader.service';
import { CredentialDetailsService } from './services/credential-details.service';
import { CredentialDetailsComponent } from './credential-details.component';
import { DetailsCredentialType, MappedExtendedDetailsField } from 'src/app/core/models/entity/lear-credential-details';
import { CredentialStatus } from 'src/app/core/models/entity/lear-credential';
import * as actionHelpers from './helpers/actions-helpers';

describe('CredentialDetailsComponent', () => {
  let fixture: ComponentFixture<CredentialDetailsComponent>;
  let component: CredentialDetailsComponent;
  let mockDetailsService: {
    credentialValidFrom$: ReturnType<typeof signal>;
    credentialValidUntil$: ReturnType<typeof signal>;
    credentialType$: ReturnType<typeof signal>;
    credentialStatus$: ReturnType<typeof signal>;
    mainTemplateModel$: ReturnType<typeof signal>;
    sideTemplateModel$: ReturnType<typeof signal>;
    setProcedureId: jest.Mock;
    loadCredentialModels: jest.Mock;
    openSendReminderDialog: jest.Mock;
    openSignCredentialDialog: jest.Mock;
  };
  let mockLoader: { isLoading$: Observable<boolean> };

  beforeEach(async () => {
    // Prepare signals
    const validFrom$ = signal('2025-01-01');
    const validUntil$ = signal('2025-12-31');
    const type$ = signal<DetailsCredentialType | undefined>('LEARCredentialEmployee');
    const status$ = signal<CredentialStatus | undefined>('PEND_DOWNLOAD');
    const mainModel$ = signal<MappedExtendedDetailsField[] | undefined>([{ key: 'foo', type: 'key-value', value: 'bar' }]);
    const sideModel$ = signal<MappedExtendedDetailsField[] | undefined>([]);

    mockDetailsService = {
      credentialValidFrom$: validFrom$,
      credentialValidUntil$: validUntil$,
      credentialType$: type$,
      credentialStatus$: status$,
      mainTemplateModel$: mainModel$,
      sideTemplateModel$: sideModel$,
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

  it('creates component and initializes signals', () => {
    expect(component).toBeTruthy();
    expect(component.credentialValidFrom$()).toBe('2025-01-01');
    expect(component.credentialValidUntil$()).toBe('2025-12-31');
    expect(component.credentialType$()).toBe('LEARCredentialEmployee');
    expect(component.credentialStatus$()).toBe('PEND_DOWNLOAD');
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

  describe('computed signals', () => {
    beforeEach(() => {
      jest.spyOn(actionHelpers, 'statusHasSendReminderlButton').mockReturnValue(true);
      jest.spyOn(actionHelpers, 'credentialTypeHasSendReminderButton').mockReturnValue(true);
      jest.spyOn(actionHelpers, 'statusHasSignCredentialButton').mockReturnValue(true);
      jest.spyOn(actionHelpers, 'credentialTypeHasSignCredentialButton').mockReturnValue(true);
    });

    it('showSideTemplateCard$ is false when sideTemplateModel is empty', () => {
      expect(component.showSideTemplateCard$()).toBe(false);
    });

    it('showSideTemplateCard$ becomes true when sideTemplateModel is non-empty', () => {
      // Mutem la signal, no la substituïm
      mockDetailsService.sideTemplateModel$.set([{ key: 'x', type: 'key-value', value: 'y' }]);
      expect(component.showSideTemplateCard$()).toBe(true);
    });

 it('showReminderButton$ reacts to helper functions and status signal', () => {
   expect(component.showReminderButton$()).toBe(true);

   (actionHelpers.statusHasSendReminderlButton as jest.Mock).mockReturnValue(false);

    mockDetailsService.credentialStatus$.set(undefined);
    mockDetailsService.credentialStatus$.set('PEND_DOWNLOAD');

   expect(component.showReminderButton$()).toBe(false);
 });

    it('showSignCredentialButton$ reacts to helper functions and type signal', () => {
      expect(component.showSignCredentialButton$()).toBe(true);
      (actionHelpers.credentialTypeHasSignCredentialButton as jest.Mock).mockReturnValue(false);
     
      mockDetailsService.credentialType$.set(undefined);
      mockDetailsService.credentialType$.set('LearCredentialEmployee');

      expect(component.showSignCredentialButton$()).toBe(false);
    });
  });

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
