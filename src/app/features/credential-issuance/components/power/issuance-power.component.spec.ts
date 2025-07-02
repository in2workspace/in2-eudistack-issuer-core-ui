import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { AuthService } from "src/app/core/services/auth.service";
import { DialogWrapperService } from "src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service";
import { IssuancePowerComponent } from "./issuance-power.component";
import { IssuanceFormPowerSchema } from "src/app/core/models/entity/lear-credential-issuance";

describe('IssuancePowerComponent', () => {
  let component: IssuancePowerComponent;
  let fixture: ComponentFixture<IssuancePowerComponent>;
  let translateService: TranslateService;
  let mockDialog: { openDialogWithCallback: jest.Mock<any> };
  let mockAuthService: { hasIn2OrganizationIdentifier: jest.Mock<any> };

  beforeEach(async () => {
    mockDialog = {
      openDialogWithCallback: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(true)) })
    };
    mockAuthService = {
      hasIn2OrganizationIdentifier: jest.fn().mockReturnValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([]),
        IssuancePowerComponent
      ],
      providers: [
        TranslateService,
        { provide: DialogWrapperService, useValue: mockDialog },
        { provide: AuthService, useValue: mockAuthService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuancePowerComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mapToTempPowerSchema should add isDisabled and filter by isIn2Required flag', () => {
    (mockAuthService.hasIn2OrganizationIdentifier as jest.Mock).mockReturnValue(false);
    component.organizationIdentifierIsIn2 = false; // ensure internal flag matches mock
    const powers: IssuanceFormPowerSchema[] = [
      { function: 'f1', action: ['a'], isIn2Required: false },
      { function: 'f2', action: ['a'], isIn2Required: true }
    ];
    const result = (component as any).mapToTempPowerSchema(powers);
    expect(result).toEqual([
      { function: 'f1', action: ['a'], isIn2Required: false, isDisabled: false }
    ]);
  });

  it('setter powersInput should warn on empty and reset form', () => {
    const spyWarn = jest.spyOn(console, 'warn').mockImplementation();
    component.form.addControl('test', new FormGroup({}));
    component.powersInput = [];
    expect(spyWarn).toHaveBeenCalledWith('Power component received empty list.');
    expect(Object.keys(component.form.controls)).toHaveLength(0);
    spyWarn.mockRestore();
  });

  describe('addPower', () => {
    const mockPowers: IssuanceFormPowerSchema[] = [
      { function: 'f1', action: ['act1', 'act2'], isIn2Required: false }
    ];

    beforeEach(() => {
      component.powersInput = mockPowers;
    });

    it('should log error if no actions present', () => {
      const powerWithoutActions: any = { function: 'f2', action: undefined };
      component._powersInput.push(powerWithoutActions);
      const spyError = jest.spyOn(console, 'error').mockImplementation();
      component.addPower('f2');
      expect(spyError).toHaveBeenCalledWith('No actions for this power');
      spyError.mockRestore();
    });

    it('should add form group and disable selected power', () => {
      (component as any).selectedPower = { function: 'f1', action: ['act1', 'act2'], isDisabled: false };
      component.addPower('f1');
      expect(component.form.contains('f1')).toBeTruthy();
      const group = component.form.get('f1') as FormGroup;
      expect(group.value).toEqual({ act1: false, act2: false });
      const selector = component.selectorPowers.find(p => p.function === 'f1');
      expect(selector?.isDisabled).toBeTruthy();
      expect(component.selectedPower).toBeUndefined();
    });
  });

  describe('removePower', () => {
    const mockPowers: IssuanceFormPowerSchema[] = [
      { function: 'f1', action: ['act'], isIn2Required: false }
    ];

    beforeEach(() => {
      component.powersInput = mockPowers;
      component.addPower('f1');
    });

    it('should remove control and enable power after confirmation', () => {
      let callback: any;
      mockDialog.openDialogWithCallback.mockImplementation((comp, data, cb) => {
        callback = cb;
      });
      component.removePower('f1');
      expect(component.form.contains('f1')).toBeTruthy();
      expect(component.selectorPowers.find(p => p.function === 'f1')?.isDisabled).toBeTruthy();
      // simulate dialog confirmation
      callback();
      expect(component.form.contains('f1')).toBeFalsy();
      expect(component.selectorPowers.find(p => p.function === 'f1')?.isDisabled).toBeFalsy();
    });
  });

  describe('formChanges emitter', () => {
    it('should emit value and validity flags on form changes', () => {
      component.powersInput = [{ function: 'f1', action: ['a1', 'a2'], isIn2Required: false }];
      component.addPower('f1');
      const emitted: any[] = [];
      component.formChanges.subscribe(v => emitted.push(v));
      const control = component.form.get('f1') as FormGroup;
      control.get('a1')?.setValue(true);
      expect(emitted.length).toBe(1);
      expect(emitted[0]).toEqual({ value: { f1: { a1: true, a2: false } }, hasOnePower: true, hasOneActionPerPower: true });
      control.get('a2')?.setValue(true);
      expect(emitted.length).toBe(2);
      expect(emitted[1]).toEqual({ value: { f1: { a1: true, a2: true } }, hasOnePower: true, hasOneActionPerPower: true });
    });
  });

  it('getPowerByFunction should return matching power', () => {
    component.powersInput = [{ function: 'fX', action: ['a'], isIn2Required: false }];
    const power = component.getPowerByFunction('fX');
    expect(power?.function).toBe('fX');
  });

  it('getFormGroup should cast control to FormGroup', () => {
    const fg = new FormGroup({});
    expect(component.getFormGroup(fg)).toBeInstanceOf(FormGroup);
  });

  it('resetForm should clear all controls', () => {
    component.form.addControl('t', new FormGroup({}));
    expect(component.form.contains('t')).toBeTruthy();
    (component as any).resetForm();
    expect(Object.keys(component.form.controls)).toHaveLength(0);
  });

  it('submit should log to console', () => {
    const spyLog = jest.spyOn(console, 'log').mockImplementation();
    component.submit();
    expect(spyLog).toHaveBeenCalledWith('submit: ');
    spyLog.mockRestore();
  });
});
