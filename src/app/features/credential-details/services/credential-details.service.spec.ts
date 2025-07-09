import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CredentialDetailsService } from './credential-details.service';
import { FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { CredentialActionsService } from './credential-actions.service';
import { of } from 'rxjs';
import * as utils from '../utils/credential-details-utils';
import { LEARCredentialDataDetails } from 'src/app/core/models/entity/lear-credential';
import { FormGroup } from '@angular/forms';

describe('CredentialDetailsService', () => {
  let service: CredentialDetailsService;

  const mockCredentialProcedureService = {
    getCredentialProcedureById: jest.fn(),
  };

  const mockCredentialActionsService = {
    openSendReminderDialog: jest.fn(),
    openSignCredentialDialog: jest.fn(),
    openRevokeCredentialDialog: jest.fn(),
  };

  const mockDialogWrapperService = {
    openErrorInfoDialog: jest.fn()
  } as any;
  const mockRouter = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        CredentialDetailsService,
        FormBuilder,
        { provide: CredentialProcedureService, useValue: mockCredentialProcedureService },
        { provide: CredentialActionsService, useValue: mockCredentialActionsService },
        { provide: DialogWrapperService, useValue: mockDialogWrapperService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(CredentialDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should loadCredentialDetailsAndForm and call loadForm', () => {
    const mockData = {} as any;
    jest.spyOn(service as any, 'loadCredentialDetails').mockReturnValue(of(mockData));
    const loadFormSpy = jest.spyOn(service as any, 'loadForm').mockImplementation();

    service.loadCredentialDetailsAndForm();

    expect((service as any).loadCredentialDetails).toHaveBeenCalled();
    expect(loadFormSpy).toHaveBeenCalled();
  });

  it('should fetch credential details and update signals', (done) => {
    const mockProcedureId = 'test-id';
    const mockData = {
      credential_status: 'VALID',
      credential: { vc: {} as any }
    } as LEARCredentialDataDetails;

    service.procedureId$.set(mockProcedureId);
    mockCredentialProcedureService.getCredentialProcedureById.mockReturnValue(of(mockData));

    (service as any).loadCredentialDetails().subscribe((result: any) => {
      expect(result).toBe(mockData);
      expect(service.credentialDetailsData$()).toBe(mockData);
      expect(service.credentialStatus$()).toBe('VALID');
      done();
    });
  });

  it('should load form and update signals', () => {
    const mockCredential = {
      validFrom: '2023-01-01',
      validUntil: '2023-12-31',
      type: ['LEARCredentialEmployee'],
    };
    const mockData = { credential: { vc: mockCredential } } as any;
    const mockSchema = { fake: 'schema' } as any;
    const mockFormData = { name: 'John' } as any;
    const mockFormGroup = new FormBuilder().group({ name: [''] });

    service.credentialDetailsData$.set(mockData);
    jest.spyOn(utils, 'getFormSchemaByType').mockReturnValue(mockSchema);
    jest.spyOn(utils, 'getFormDataByType').mockReturnValue(mockFormData);
    jest.spyOn(utils, 'buildFormFromSchema').mockReturnValue(mockFormGroup);

    (service as any).loadForm();

    expect(service.credentialValidFrom$()).toBe('2023-01-01');
    expect(service.credentialValidUntil$()).toBe('2023-12-31');
    expect(service.credentialType$()).toBe('LEARCredentialEmployee');
    expect(service.credentialDetailsFormSchema$()).toBe(mockSchema);
    expect(service.credentialDetailsForm$()).toBe(mockFormGroup);
  });

  it('should set the procedureId$ signal when setProcedureId is called', () => {
    service.setProcedureId('abc123');
    expect(service.procedureId$()).toBe('abc123');
  });

  it('should call actionsService.openSendReminderDialog with procedureId', () => {
    service.procedureId$.set('pid123');
    service.openSendReminderDialog();
    expect(mockCredentialActionsService.openSendReminderDialog).toHaveBeenCalledWith('pid123');
  });

  it('should call actionsService.openSignCredentialDialog with procedureId', () => {
    service.procedureId$.set('pid456');
    service.openSignCredentialDialog();
    expect(mockCredentialActionsService.openSignCredentialDialog).toHaveBeenCalledWith('pid456');
  });

  it('should call actionsService.openRevokeCredentialDialog with credentialId and listId', () => {
    const mockCredential = {
      id: 'cred789',
      credentialStatus: { statusListCredential: ['list1', 'list2'] }
    } as any;
    const mockData = { credential: { vc: mockCredential } } as any;
    service.credentialDetailsData$.set(mockData);

    service.openRevokeCredentialDialog();
    expect(mockCredentialActionsService.openRevokeCredentialDialog)
      .toHaveBeenCalledWith('cred789', 'list2');
  });

    it('should show error dialog if credential id is missing', () => {
    const mockWithoutId = { credential: { vc: { id: undefined } } } as any;
    service.credentialDetailsData$.set(mockWithoutId);

    service.openRevokeCredentialDialog();

    expect(mockDialogWrapperService.openErrorInfoDialog).toHaveBeenCalledWith('error.unknown_error');
    expect(mockCredentialActionsService.openRevokeCredentialDialog).not.toHaveBeenCalled();
  });

  it('should show error dialog if statusListCredential is missing', () => {
    const mockCredential = { id: 'credXYZ' } as any;
    const mockData = { credential: { vc: mockCredential } } as any;
    service.credentialDetailsData$.set(mockData);

    service.openRevokeCredentialDialog();

    expect(mockDialogWrapperService.openErrorInfoDialog).toHaveBeenCalledWith('error.unknown_error');
    expect(mockCredentialActionsService.openRevokeCredentialDialog).not.toHaveBeenCalled();
  });
});
