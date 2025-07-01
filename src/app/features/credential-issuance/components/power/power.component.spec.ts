import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { AuthService } from "src/app/core/services/auth.service";
import { DialogData } from "src/app/shared/components/dialog/dialog-data";
import { DialogWrapperService } from "src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service";
import { PowerComponent } from "./power.component";

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
        { provide: AuthService, useValue: mockAuthService }
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

});
