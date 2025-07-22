import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CredentialIssuanceComponent } from './credential-issuance.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CredentialIssuanceService } from '../../services/credential-issuance.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { ConditionalConfirmDialogComponent } from 'src/app/shared/components/dialog/conditional-confirm-dialog/conditional-confirm-dialog.component';

// Mock services
class MockCredentialIssuanceService {
  formSchemasBuilder = jest.fn((type, asSigner) => [{}, {}]);
  formBuilder = jest.fn(() => new FormGroup({}));
  submitCredential = jest.fn(() => of({}));
}

class MockDialogWrapperService {
  openDialogWithCallback = jest.fn((comp, data, cb) => cb());
  openDialog = jest.fn(() => ({ afterClosed: () => of(true) }));
}

class MockTranslateService {
  instant = jest.fn((key: string) => key);
}

describe('CredentialIssuanceComponent', () => {
  let component: CredentialIssuanceComponent;
  let fixture: ComponentFixture<CredentialIssuanceComponent>;
  let issuanceService: MockCredentialIssuanceService;
  let dialogService: MockDialogWrapperService;
  let router: Router;

  beforeEach(async () => {
    issuanceService = new MockCredentialIssuanceService();
    dialogService = new MockDialogWrapperService();

    await TestBed.configureTestingModule({
      imports: [
        CredentialIssuanceComponent,
        ReactiveFormsModule,
        MatSelectModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: CredentialIssuanceService, useValue: issuanceService },
        { provide: DialogWrapperService, useValue: dialogService },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { pathFromRoot: [] } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CredentialIssuanceComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updateAlertMessages should append messages', () => {
    component.bottomAlertMessages$.set(['initial']);
    component.updateAlertMessages(['new1', 'new2']);
    expect(component.bottomAlertMessages$()).toEqual(['initial', 'new1', 'new2']);
  });

  it('onSelectionChange sets new credential type when no change guard', () => {
    const select: any = { value: null };
    component.onSelectionChange('TypeA' as any, select);
    expect(component.selectedCredentialType$()).toBe('TypeA');
  });

  it('onSelectionChange prevents change if guard returns false', () => {
    const select: any = { value: 'LEARCredentialEmployee' };
    component.selectedCredentialType$.set('LEARCredentialEmployee');
    jest.spyOn<any, any>(component as any, 'canLeave').mockReturnValue(false);
    window.confirm = jest.fn().mockReturnValue(false);

    component.onSelectionChange('newType' as any, select);
    expect(component.selectedCredentialType$()).toBe('LEARCredentialEmployee');
    expect(select.value).toBe('LEARCredentialEmployee');
  });

  it('onSubmit does nothing when form invalid', () => {
    // set underlying isFormValid signal to false
    component['isFormValid$'].set(false);
    component.onSubmit();
    expect(dialogService.openDialogWithCallback).not.toHaveBeenCalled();
    expect(issuanceService.submitCredential).not.toHaveBeenCalled();
  });

  it('onSubmit opens normal dialog for non-LEAR type when valid', fakeAsync(() => {
    component.selectedCredentialType$.set('SomeType' as any);
    component['isFormValid$'].set(true);
    component.onSubmit();
    tick();
    expect(dialogService.openDialogWithCallback).toHaveBeenCalledWith(
      DialogComponent,
      expect.any(Object),
      expect.any(Function)
    );
  }));

  it('onSubmit opens LEAR dialog for LEARCredentialMachine type when valid', fakeAsync(() => {
    component.selectedCredentialType$.set('LEARCredentialMachine');
    component['isFormValid$'].set(true);
    component.onSubmit();
    tick();
    expect(dialogService.openDialogWithCallback).toHaveBeenCalledWith(
      ConditionalConfirmDialogComponent,
      expect.any(Object),
      expect.any(Function)
    );
  }));

  it('canDeactivate returns true when canLeave true', () => {
    jest.spyOn<any, any>(component as any, 'canLeave').mockReturnValue(true);
    expect(component.canDeactivate()).toBe(true);
  });

  it('canDeactivate calls confirm when canLeave false', () => {
    jest.spyOn<any, any>(component as any, 'canLeave').mockReturnValue(false);
    jest.spyOn<any, any>(component as any, 'openLeaveConfirm').mockReturnValue('confirm' as any);
    expect(component.canDeactivate()).toBe('confirm');
  });

  it('ngOnDestroy emits and completes destroyForm$', () => {
    const destroy$ = component['destroyForm$'] as Subject<void>;
    jest.spyOn(destroy$, 'next');
    jest.spyOn(destroy$, 'complete');

    component.ngOnDestroy();
    expect(destroy$.next).toHaveBeenCalled();
    expect(destroy$.complete).toHaveBeenCalled();
  });

  it('navigateToCredentials calls router.navigate', fakeAsync(() => {
    (router.navigate as jest.Mock).mockReturnValue(Promise.resolve(true));
    let result: boolean | undefined;
    component.navigateToCredentials().then(res => result = res);
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/organization/credentials']);
    expect(result).toBe(true);
  }));

});
