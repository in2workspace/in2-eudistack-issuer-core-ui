import { DialogData } from 'src/app/shared/components/dialog/dialog-data';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IssuancePowerComponent, TempIssuanceFormPowerSchema } from './issuance-power.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IssuanceFormPowerSchema } from 'src/app/core/models/entity/lear-credential-issuance';
import { of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CredentialIssuanceService } from '../../services/credential-issuance.service';

describe('IssuancePowerComponent', () => {
  let component: IssuancePowerComponent;
  let fixture: ComponentFixture<IssuancePowerComponent>;
  let authService: Partial<AuthService>;
  let dialog: Partial<DialogWrapperService>;
  let translate: Partial<TranslateService>;
  const proto = IssuancePowerComponent.prototype as any;
  let mockIssuanceService: Partial<CredentialIssuanceService>;

  beforeEach(async () => {
    proto.updateMessages = () => () => {};
    proto.data = () => [];
    proto.resetForm = () => {};
    proto.mapToTempPowerSchema = function(powers: IssuanceFormPowerSchema[]) {
      return (powers || [])
        .map(p => ({ ...p, isDisabled: false }))
        .filter(p => this.organizationIdentifierIsIn2 || !p.isIn2Required);
    };
    Object.defineProperty(proto, 'powersInput', {
      configurable: true,
      set(this: IssuancePowerComponent, value: IssuanceFormPowerSchema[]) {
        if (value !== undefined) {
          (this as any).resetForm();
          this['_powersInput'] = value || [];
          this.selectorPowers = (this as any).mapToTempPowerSchema(value);
        }
      }
    });
    mockIssuanceService = {
      updateAlertMessages: jest.fn()
    };

    authService = { hasIn2OrganizationIdentifier: jest.fn() };
    dialog = { openDialogWithCallback: jest.fn() };
    translate = { instant: jest.fn((key: string) => `t:${key}`), get: jest.fn().mockReturnValue(of(undefined)) };

    await TestBed.configureTestingModule({
      imports: [IssuancePowerComponent, ReactiveFormsModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: DialogWrapperService, useValue: dialog },
        { provide: CredentialIssuanceService, useValue: mockIssuanceService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IssuancePowerComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    (authService.hasIn2OrganizationIdentifier as jest.Mock).mockReturnValue(true);
    Object.defineProperty(component, 'form', {
      value: () => new FormGroup({}),
      configurable: true
    });
    component.powersInput = [];
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('organizationIdentifierIsIn2 is truthy if the service indicates so', () => {
    (authService.hasIn2OrganizationIdentifier as jest.Mock).mockReturnValue(true);
    Object.defineProperty(component, 'form', {
      value: () => new FormGroup({}),
      configurable: true
    });
    component.organizationIdentifierIsIn2 = true;
    component.powersInput = [];
    fixture.detectChanges();
    expect(component.organizationIdentifierIsIn2).toBeTruthy();

    (authService.hasIn2OrganizationIdentifier as jest.Mock).mockReturnValue(false);
    const f2 = TestBed.createComponent(IssuancePowerComponent);
    const cmp2 = f2.componentInstance;
    Object.defineProperty(cmp2, 'form', {
      value: () => new FormGroup({}),
      configurable: true
    });
    cmp2.organizationIdentifierIsIn2 = false;
    cmp2.powersInput = [];
    f2.detectChanges();
    expect(cmp2.organizationIdentifierIsIn2).toBeFalsy();
  });

  it('keepOrder always returns 0', () => {
    expect(component.keepOrder('x', 'y')).toBe(0);
  });

  it('addPower adds a control and disables the selector', () => {
    (authService.hasIn2OrganizationIdentifier as jest.Mock).mockReturnValue(true);
    const schema: TempIssuanceFormPowerSchema = {
      function: 'power1',
      action: ['act1','act2'],
      isIn2Required: false,
      isDisabled: false
    };
    component.powersInput = [schema];
    component.selectedPower = schema;
    const fg = new FormGroup({});
    (component as any).form = () => fg;

    component.addPower('power1');

    expect(fg.contains('power1')).toBeTruthy();
    const child = fg.get('power1') as any;
    expect((child.get('act1') as FormControl)).toBeTruthy();
    expect((child.get('act2') as FormControl)).toBeTruthy();

    const p = component.selectorPowers.find(pw => pw.function==='power1')!;
    expect(p.isDisabled).toBeTruthy();
    expect(component.selectedPower).toBeUndefined();
  });

  it('addPower with undefined actions logs an error and does not modify the form', () => {
    console.error = jest.fn();
    (authService.hasIn2OrganizationIdentifier as jest.Mock).mockReturnValue(true);
    const schema: IssuanceFormPowerSchema = {
      function: 'p2',
      action: undefined as any,
      isIn2Required: false
    };
    component.powersInput = [schema];
    const fg = new FormGroup({});
    (component as any).form = () => fg;

    component.addPower('p2');
    expect(console.error).toHaveBeenCalledWith('No actions for this power');
    expect(fg.contains('p2')).toBeFalsy();
  });

  it('removePower opens the dialog then removes the control and enables the selector', fakeAsync(() => {
    (authService.hasIn2OrganizationIdentifier as jest.Mock).mockReturnValue(true);
    const schema: IssuanceFormPowerSchema = {
      function: 'pw',
      action: ['a'],
      isIn2Required: false
    };
    component.powersInput = [schema];
    const fg = new FormGroup({});
    (component as any).form = () => fg;
    component.addPower('pw');

    (dialog.openDialogWithCallback as jest.Mock).mockImplementation((_, data: DialogData, cb: any) => {
      expect(data.title).toBe('power.remove-dialog.title');
      expect(data.message).toBe('power.remove-dialog.messagepw');
      return cb();
    });

    component.removePower('pw');
    tick();

    expect(fg.contains('pw')).toBeFalsy();
    const p = component.selectorPowers.find(x => x.function==='pw')!;
    expect(p.isDisabled).toBeFalsy();
  }));

  it('ngOnInit initializes data() and subscribes to valueChanges', fakeAsync(() => {
    (authService.hasIn2OrganizationIdentifier as jest.Mock).mockReturnValue(true);
    const initial: IssuanceFormPowerSchema[] = [
      { function: 'f', action: ['x'], isIn2Required: false }
    ];
    (component as any).data = () => initial;
    const fg = new FormGroup({});
    (component as any).form = () => fg;

    component.ngOnInit();
    expect(component['_powersInput']).toEqual(initial);
    expect(component.selectorPowers.length).toBe(1);

    fg.addControl('f', new FormGroup({ x: new FormControl(false) }));
    fg.patchValue({ f: { x: true } });
    tick();

  }));

  it('getPowerByFunction returns the correct element', () => {
    component.selectorPowers = [
      { function: 'a', action: [], isIn2Required: false, isDisabled: false }
    ];
    expect(component.getPowerByFunction('a')).toEqual(component.selectorPowers[0]);
    expect(component.getPowerByFunction('nope')).toBeUndefined();
  });

  it('getFormGroup performs the correct cast', () => {
    const fg = new FormGroup({});
    expect(component.getFormGroup(fg)).toBe(fg);
  });

});
