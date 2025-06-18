import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PowerComponent } from './power.component';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormCredentialService } from '../form-credential/services/form-credential.service';
import { DialogData } from '../dialog/dialog-component/dialog.component';
import { of } from 'rxjs';
import { DialogWrapperService } from '../dialog/dialog-wrapper/dialog-wrapper.service';

const mockDialogRef = {
  afterClosed:jest.fn().mockReturnValue(of(true)) };

describe('PowerComponent', () => {
  let component: PowerComponent;
  let fixture: ComponentFixture<PowerComponent>;
  let debugElement: DebugElement;

  let translateService: TranslateService;
  let mockDialog : { openDialogWithCallback:jest.Mock<any> };
  let mockAuthService: { hasIn2OrganizationIdentifier: jest.Mock };
  let mockFormService: {
    getAddedPowers: jest.Mock,
    getPlainAddedPowers: jest.Mock,
    getSelectedPowerName: jest.Mock,
    getPlainSelectedPower: jest.Mock,
    addPower: jest.Mock,
    setSelectedPowerName: jest.Mock,
    removePower: jest.Mock,
    checkIfPowerIsAdded: jest.Mock,
  }

  beforeEach(async () => {
    mockDialog={
      openDialogWithCallback:jest.fn().mockReturnValue(mockDialogRef)
    }
    mockAuthService = {
      hasIn2OrganizationIdentifier: jest.fn().mockReturnValue(true),
    };
    mockFormService = {
      getAddedPowers: jest.fn(),
      getPlainAddedPowers: jest.fn().mockReturnValue([]),
      getSelectedPowerName: jest.fn(),
      getPlainSelectedPower: jest.fn().mockReturnValue(''),
      addPower: jest.fn(),
      setSelectedPowerName: jest.fn(),
      removePower: jest.fn(),
      checkIfPowerIsAdded: jest.fn().mockReturnValue(false)
    };

    await TestBed.configureTestingModule({
    imports: [
        TranslateModule.forRoot(),
        FormsModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([]),
        PowerComponent,
    ],
    providers: [
      TranslateService,
        { provide: DialogWrapperService, useValue: mockDialog },
        { provide: AuthService, useValue: mockAuthService },
        { provide: FormCredentialService, useValue: mockFormService }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call hasIn2OrganizationIdentifier on ngOnInit', () => {
    const spy = jest.spyOn(mockAuthService, 'hasIn2OrganizationIdentifier');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    expect(component.organizationIdentifierIsIn2).toBe(true);
  });

  it('should not add "Onboarding" option if organizationIdentifierIsIn2 is false', () => {
    mockAuthService.hasIn2OrganizationIdentifier.mockReturnValue(false);
    mockFormService.getPlainSelectedPower.mockReturnValue('Onboarding');

    component.ngOnInit();
    component.addPower();

    expect(mockFormService.addPower).not.toHaveBeenCalled();
  });

  it('should add "Onboarding" option if organizationIdentifierIsIn2 is true', () => {
    mockAuthService.hasIn2OrganizationIdentifier.mockReturnValue(true);
    mockFormService.getPlainSelectedPower.mockReturnValue('Onboarding');

    component.ngOnInit();
    component.addPower();

    expect(mockFormService.addPower).toHaveBeenCalledWith(
      {
        action: '',
        domain: 'DOME',
        function: 'Onboarding',
        type: 'Domain',
        execute: false,
        create: false,
        update: false,
        delete: false,
        upload: false,
        attest: false
      });


    expect(mockFormService.setSelectedPowerName).toHaveBeenCalledWith('');
  });

  it('should add "Certification" option if organizationIdentifierIsIn2 is true', () => {
    mockAuthService.hasIn2OrganizationIdentifier.mockReturnValue(true);
    mockFormService.getPlainSelectedPower.mockReturnValue('Certification');

    component.ngOnInit();
    component.addPower();

    expect(mockFormService.addPower).toHaveBeenCalledWith(
      {
        action: '',
        domain: 'DOME',
        function: 'Certification',
        type: 'Domain',
        execute: false,
        create: false,
        update: false,
        delete: false,
        upload: false,
        attest: false,
      }
    );

    expect(mockFormService.setSelectedPowerName).toHaveBeenCalledWith('');
  });

  it('should not add an option if it already exists', () => {
    mockFormService.getPlainSelectedPower.mockReturnValue('Certification');

    component.ngOnInit();
    component.addPower();

    expect(mockFormService.addPower).toHaveBeenCalledWith(
      {
        action: '',
        domain: 'DOME',
        function: 'Certification',
        type: 'Domain',
        execute: false,
        create: false,
        update: false,
        delete: false,
        upload: false,
        attest: false,
      }
    );

    expect(mockFormService.setSelectedPowerName).toHaveBeenCalledWith('');
  });

  it('should not add an option if it already exists', () => {
    mockFormService.getPlainSelectedPower.mockReturnValue('TestOption');
    mockFormService.checkIfPowerIsAdded.mockReturnValue(true);

    component.addPower();

    expect(mockFormService.addPower).not.toHaveBeenCalled();
  });

  it('should remove power', () => {
    const powerToRemove = 'update';
    const dialogData: DialogData = {
      title: translateService.instant("power.remove-dialog.title"),
      message: translateService.instant("power.remove-dialog.message") + powerToRemove,
      confirmationType: 'sync',
      status: 'default'
    };

    jest.spyOn(mockFormService, 'removePower').mockImplementation();

    component.removePower(powerToRemove);

    expect(mockDialog.openDialogWithCallback).toHaveBeenCalledWith(
      expect.objectContaining(dialogData),
      expect.any(Function)
    );

    const [, callbackFn] = mockDialog.openDialogWithCallback.mock.calls[0];

    callbackFn();
    expect(mockFormService.removePower).toHaveBeenCalledWith(powerToRemove);
  });


  it('should handle select change', () => {
    const eventValue = 'eventValue';
    const event = {value:eventValue} as any;
    const spy = jest.spyOn(mockFormService, 'setSelectedPowerName');

    component.onHandleSelectChange(event);

    expect(spy).toHaveBeenCalledWith(eventValue);
  });

  it('should check if option is disabled', ()=>{
    const powerName = 'powerName'
    component.isOptionDisabled(powerName);
    expect(mockFormService.checkIfPowerIsAdded).toHaveBeenCalledWith(powerName);
  });
});
