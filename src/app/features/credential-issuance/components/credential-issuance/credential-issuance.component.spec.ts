import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal, Signal, WritableSignal } from '@angular/core';
import { CredentialIssuanceComponent } from './credential-issuance.component';
import { CredentialIssuanceService } from '../../services/credential-issuance.service';
import { ActivatedRoute } from '@angular/router';
import { MatSelect } from '@angular/material/select';
import { FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CredentialIssuanceComponent', () => {
  let component: CredentialIssuanceComponent;
  let fixture: ComponentFixture<CredentialIssuanceComponent>;
  let mockService: Partial<CredentialIssuanceService>;
  let routeMock: Partial<ActivatedRoute>;

  beforeEach(async () => {
    // Prepare basic signals for all service properties used
    const emptyFormGroup = new FormGroup({});

    mockService = {
      // Signals
      asSigner$: signal(false) as WritableSignal<boolean>,
      hasSubmitted$: signal(false) as WritableSignal<boolean>,
      credentialTypesArr: ['type1', 'LEARCredentialMachine'] as any,
      selectedCredentialType$: signal(undefined) as WritableSignal<any>,
      credentialFormSchema$: signal(null) as Signal<any>,
      staticData$: signal(null) as Signal<any>,
      form$: signal(emptyFormGroup) as Signal<FormGroup>,
      formValue$: signal({ foo: 'bar' }) as Signal<Record<string, any>>,
      isFormValid$: signal(false) as Signal<boolean>,
      bottomAlertMessages$: signal([]) as WritableSignal<string[]>,
      // Methods
      updateSelectedType: jest.fn(),
      canLeave: jest.fn().mockReturnValue(true),
      canDeactivate: jest.fn().mockReturnValue('canDeactivateReturn'),
      openLeaveConfirm: jest.fn().mockReturnValue(true),
      openSubmitDialog: jest.fn(),
      openLEARCredentialMachineSubmitDialog: jest.fn(),
    };

    routeMock = {
      snapshot: { pathFromRoot: [{ url: [] }] } as any
    };

    await TestBed.configureTestingModule({
      imports: [CredentialIssuanceComponent, ReactiveFormsModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: CredentialIssuanceService, useValue: mockService },
        { provide: ActivatedRoute, useValue: routeMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CredentialIssuanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize asSigner$ based on route', () => {
    expect(mockService.asSigner$!()).toBeFalsy();
  });

  describe('onTypeSelectionChange', () => {
    it('should call updateSelectedType on the service', () => {
      const type = 'type1';
      const matSelect = {} as MatSelect;
      component.onTypeSelectionChange(type as any, matSelect);
      expect(mockService.updateSelectedType).toHaveBeenCalledWith(type, matSelect);
    });
  });

  describe('canLeave', () => {
    it('should delegate to service.canLeave()', () => {
      (mockService.canLeave as jest.Mock).mockReturnValue(false);
      expect(component.canLeave()).toBeFalsy();
      expect(mockService.canLeave).toHaveBeenCalled();
    });
  });

  describe('canDeactivate', () => {
    it('should delegate to service.canDeactivate()', () => {
      const result = component.canDeactivate();
      expect(mockService.canDeactivate).toHaveBeenCalled();
      expect(result).toBe('canDeactivateReturn');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('should not proceed when form is invalid', () => {
      // Override component signals
      (component as any).isFormValid$ = () => false;
      (component as any).formValue$ = () => ({ foo: 'bar' });

      component.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Invalid form: ');
      expect(mockService.openSubmitDialog).not.toHaveBeenCalled();
      expect(mockService.openLEARCredentialMachineSubmitDialog).not.toHaveBeenCalled();
    });

    it('should open LEARCredentialMachine dialog when selected type is LEARCredentialMachine', () => {
      (component as any).isFormValid$ = () => true;
      (component as any).formValue$ = () => ({ foo: 'bar' });
      (component as any).selectedCredentialType$ = () => 'LEARCredentialMachine' as any;

      component.onSubmit();

      expect(mockService.openLEARCredentialMachineSubmitDialog).toHaveBeenCalled();
      expect(mockService.openSubmitDialog).not.toHaveBeenCalled();
    });

    it('should open default submit dialog for other credential types', () => {
      (component as any).isFormValid$ = () => true;
      (component as any).formValue$ = () => ({ foo: 'bar' });
      (component as any).selectedCredentialType$ = () => 'type1' as any;

      component.onSubmit();

      expect(mockService.openSubmitDialog).toHaveBeenCalled();
      expect(mockService.openLEARCredentialMachineSubmitDialog).not.toHaveBeenCalled();
    });
  });
});
