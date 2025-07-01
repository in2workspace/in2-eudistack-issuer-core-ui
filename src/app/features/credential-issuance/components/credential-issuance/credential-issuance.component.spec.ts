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

// Mock services
class MockCredentialIssuanceService {
  schemasBuilder = jest.fn((type, asSigner) => [{}, {}]);
  formBuilder = jest.fn(() => new FormGroup({}));
  getPowersSchemaFromCredentialType = jest.fn(() => ({}));
  submitCredential = jest.fn(() => of({}));
}

class MockDialogWrapperService {
  openDialogWithCallback = jest.fn((comp, data, cb) => cb());
  openDialog = jest.fn(() => ({ afterClosed: () => of(true) }));
}

class MockTranslateService {
  instant = jest.fn((key: string) => key);
  get = jest.fn().mockReturnValue(of());
  stream  = jest.fn().mockReturnValue(of(''));
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

  // it('should set credentialsTypesArr correctly', () => {
  //   expect(component.credentialTypesArr).toBeDefined();
  //   expect(Array.isArray(component.credentialTypesArr)).toBe(true);
  // });

  // it('needsKeys$ should be false when no type selected', () => {
  //   expect(component.needsKeys$()).toBe(false);
  // });

  // it('updateKeys should update keys signal', () => {
  //   component.updateKeys({ generatedKey: 'abc' });
  //   expect(component.keys$()).toEqual({ generatedKey: 'abc' });
  // });

  // it('updatePowers should update power signals', () => {
  //   const powerState = { value: { f: {} }, hasOnePower: true, hasOneActionPerPower: true };
  //   component.updatePowers(powerState as any);
  //   expect(component.powersValue$()).toEqual(powerState.value);
  //   expect(component.powersHasOneFunction$()).toBe(true);
  //   expect(component.powersHaveOneAction$()).toBe(true);
  // });

  // describe('onSelectionChange', () => {
  //   it('should set selectedCredentialType when no dirty form', () => {
  //     component.onSelectionChange('LEARCredentialUser' as any, { value: undefined } as any);
  //     expect(component.selectedCredentialType$()).toBe('LEARCredentialUser');
  //   });
  // });

  // it('canLeave returns true if no changes', () => {
  //   spyOn(component, 'canLeave').and.callThrough();
  //   expect(component['canLeave']()).toBe(true);
  // });

  // describe('onSubmit', () => {
  //   it('should open submit dialog when valid and not machine type', fakeAsync(() => {
  //     // make valid global state
  //     component.selectedCredentialType$.set('LEARCredentialUser' as any);
  //     component.isFormValid$.set(true);
  //     component.powersHasOneFunction$.set(false);
  //     component.powersHaveOneAction$.set(false);
  //     component.keys$.set(undefined);

  //     component.onSubmit();
  //     tick();
  //     expect(dialogService.openDialogWithCallback).toHaveBeenCalled();
  //   }));

  //   it('should open machine submit dialog for LEARCredentialMachine', fakeAsync(() => {
  //     component.selectedCredentialType$.set('LEARCredentialMachine' as any);
  //     component.isFormValid$.set(true);
  //     component.powersHasOneFunction$.set(false);
  //     component.powersHaveOneAction$.set(false);
  //     component.keys$.set(undefined);

  //     component.onSubmit();
  //     tick();
  //     expect(dialogService.openDialogWithCallback).toHaveBeenCalledWith(
  //       expect.anything(), expect.anything(), component['submitAsCallback']
  //     );
  //   }));
  // });
});
