import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CredentialDetailsService } from './credential-details.service';
import { FormBuilder } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { of } from 'rxjs';
import { DialogData } from 'src/app/shared/components/dialog/dialog.component';
import { CredentialFormData, LEARCredentialDataDetails } from 'src/app/core/models/entity/lear-credential';
import * as utils from '../helpers/credential-details-helpers';

describe('CredentialDetailsService', () => {
  let service: CredentialDetailsService;

  const mockCredentialProcedureService = {
    getCredentialProcedureById: jest.fn(),
    sendReminder: jest.fn(),
    signCredential: jest.fn(),
  };

  const mockDialogWrapperService = {
    openDialogWithCallback: jest.fn(),
    openDialog: jest.fn().mockReturnValue({ afterClosed: () => of(true) }),
  };

  const mockRouter = {
    navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        reload: jest.fn(),
      },
      writable: true,
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        CredentialDetailsService,
        FormBuilder,
        TranslateService,
        { provide: CredentialProcedureService, useValue: mockCredentialProcedureService },
        { provide: DialogWrapperService, useValue: mockDialogWrapperService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(CredentialDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('should subscribe to loadCredentialDetails and call loadFormObserver.next', () => {
  //   const mockData = {} as any;
  
  //   const loadCredentialDetailsSpy = jest
  //     .spyOn(service, 'loadCredentialDetails')
  //     .mockReturnValue(of(mockData));
  
  //   const observerNextSpy = jest.spyOn((service as any).loadFormObserver, 'next');
  
  //   service.loadCredentialDetailsAndForm();
  
  //   expect(loadCredentialDetailsSpy).toHaveBeenCalled();
  //   expect(observerNextSpy).toHaveBeenCalledWith(mockData);
  // });

  // it('should fetch credential details and update signals', (done) => {
  //   const mockProcedureId = 'test-id';
  //   const mockData: LEARCredentialDataDetails = {
  //     credential_status: 'VALID',
  //     credential: { vc: {} as any }
  //   } as LEARCredentialDataDetails;
  
  //   service.procedureId$.set(mockProcedureId);
  
  //   jest
  //     .spyOn(mockCredentialProcedureService, 'getCredentialProcedureById')
  //     .mockReturnValue(of(mockData));
  
  //   service.loadCredentialDetails().subscribe(result => {
  //     expect(result).toBe(mockData);
  
  //     expect(service.credentialDetailsData$()).toBe(mockData);
  //     expect(service.credentialStatus$()).toBe('VALID');
  
  //     done();
  //   });
  // });
  
  // it('should load form and update signals', () => {
  //   const mockCredential = {
  //     validFrom: '2023-01-01',
  //     validUntil: '2023-12-31',
  //     type: ['LEARCredentialEmployee'],
  //   };
  
  //   const mockData = {
  //     credential: { vc: mockCredential },
  //   } as any;
  
  //   const mockSchema = { fake: 'schema' } as any;
  //   const mockFormData = { name: 'John' } as unknown as CredentialFormData;
  //   const mockFormGroup = new FormBuilder().group({ name: [''] });
  
  //   service.credentialDetailsData$.set(mockData);
  
  //   jest.spyOn(utils, 'getFormSchemaByType').mockReturnValue(mockSchema);
  //   jest.spyOn(utils, 'getFormDataByType').mockReturnValue(mockFormData);
  //   jest.spyOn(utils, 'buildFormFromSchema').mockReturnValue(mockFormGroup);
  
  //   (service as any).loadForm();
  
  //   expect(service.credentialValidFrom$()).toBe('2023-01-01');
  //   expect(service.credentialValidUntil$()).toBe('2023-12-31');
  //   expect(service.credentialType$()).toBe('LEARCredentialEmployee');
  //   expect(service.credentialDetailsFormSchema$()).toBe(mockSchema);
  //   expect(service.credentialDetailsForm$()).toBe(mockFormGroup);
  // });

  it('should set the procedureId$ signal when setProcedureId is called', () => {
    service.setProcedureId('abc123');
    expect(service.procedureId$()).toBe('abc123');
  });
  

  it('should open a dialog with correct data and callback when openSendReminderDialog is called', () => {
    jest.spyOn(TestBed.inject(TranslateService), 'instant').mockImplementation((key: string | string[]) => {
      if (key === 'credentialDetails.sendReminderConfirm.title') return 'Mock Title';
      if (key === 'credentialDetails.sendReminderConfirm.message') return 'Mock Message';
      return typeof key === 'string' ? key : key.join(', ');
    });

    const sendReminderSpy = jest.spyOn(service, 'sendReminder').mockReturnValue(of(true));

    service.openSendReminderDialog();

    const expectedDialogData: DialogData = {
      title: 'Mock Title',
      message: 'Mock Message',
      confirmationType: 'async',
      status: 'default',
    };

    expect(mockDialogWrapperService.openDialogWithCallback).toHaveBeenCalledWith(
      expectedDialogData,
      expect.any(Function)
    );

    const callback = mockDialogWrapperService.openDialogWithCallback.mock.calls[0][1];
    callback().subscribe();

    expect(sendReminderSpy).toHaveBeenCalled();
  });

  it('should open a dialog with correct data and callback when openSignCredentialDialog is called', () => {
    jest.spyOn(TestBed.inject(TranslateService), 'instant').mockImplementation((key: string | string[]) => {
      if (key === 'credentialDetails.signCredentialConfirm.title') return 'Mock Title';
      if (key === 'credentialDetails.signCredentialConfirm.message') return 'Mock Message';
      return typeof key === 'string' ? key : key.join(', ');
    });

    const signCredentialSpy = jest.spyOn(service, 'signCredential').mockReturnValue(of(true));

    service.openSignCredentialDialog();

    const expectedDialogData: DialogData = {
      title: 'Mock Title',
      message: 'Mock Message',
      confirmationType: 'async',
      status: 'default',
    };

    expect(mockDialogWrapperService.openDialogWithCallback).toHaveBeenCalledWith(
      expectedDialogData,
      expect.any(Function)
    );

    const callback = mockDialogWrapperService.openDialogWithCallback.mock.calls[0][1];
    callback().subscribe();

    expect(signCredentialSpy).toHaveBeenCalled();
  });

  it('should send reminder, open success dialog, navigate, and reload page', fakeAsync(() => {
    service.procedureId$.set('123');
  
    const sendReminderMock = jest
      .spyOn(mockCredentialProcedureService, 'sendReminder')
      .mockReturnValue(of(undefined));
  
    const dialogRefMock = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest.spyOn(mockDialogWrapperService, 'openDialog').mockReturnValue(dialogRefMock as any);
  
    const routerNavigateSpy = jest.spyOn(mockRouter, 'navigate').mockResolvedValue(true);
    const locationReloadSpy = jest.spyOn(globalThis.location, 'reload').mockImplementation(() => {});
  
    service.sendReminder().subscribe();
  
    tick();
  
    expect(sendReminderMock).toHaveBeenCalledWith('123');
  
    const expectedDialogData: DialogData = {
      title: TestBed.inject(TranslateService).instant("credentialDetails.sendReminderSuccess.title"),
      message: TestBed.inject(TranslateService).instant("credentialDetails.sendReminderSuccess.message"),
      confirmationType: 'none',
      status: 'default',
    };
  
    expect(mockDialogWrapperService.openDialog).toHaveBeenCalledWith(expectedDialogData);
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/organization/credentials']);
    expect(locationReloadSpy).toHaveBeenCalled();
  }));

  it('should return EMPTY and log error if procedureId is missing in executeCredentialAction', () => {
    service.procedureId$.set('');
  
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const actionMock = jest.fn();
  
    const result = (service as any).executeCredentialAction(
      actionMock,
      'some.title.key',
      'some.message.key'
    );
  
    let called = false;
    result.subscribe({
      next: () => { called = true; },
      complete: () => {
        expect(called).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith('No procedure id.');
        expect(actionMock).not.toHaveBeenCalled();
        expect(mockDialogWrapperService.openDialog).not.toHaveBeenCalled();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
        expect(window.location.reload).not.toHaveBeenCalled();
      },
    });
  });
  
  

  it('should execute credential action and perform navigation + reload', fakeAsync(() => {
    service.procedureId$.set('123');
  
    const actionMock = jest.fn().mockReturnValue(of(undefined));
  
    const dialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest.spyOn(mockDialogWrapperService, 'openDialog').mockReturnValue(dialogRef as any);
  
    const translateSpy = jest.spyOn(TestBed.inject(TranslateService), 'instant')
  .mockImplementation((key: string | string[]) =>
    typeof key === 'string' ? `Translated: ${key}` : key.join(', ')
  );

    const navigateSpy = jest.spyOn(mockRouter, 'navigate').mockResolvedValue(true);
    const reloadSpy = jest.spyOn(window.location, 'reload');
  
    const result = (service as any).executeCredentialAction(
      actionMock,
      'some.title.key',
      'some.message.key'
    );
  
    tick();
  
    result.subscribe({
      complete: () => {
        expect(actionMock).toHaveBeenCalledWith('123');
  
        expect(mockDialogWrapperService.openDialog).toHaveBeenCalledWith({
          title: 'Translated: some.title.key',
          message: 'Translated: some.message.key',
          confirmationType: 'none',
          status: 'default',
        });
  
        expect(navigateSpy).toHaveBeenCalledWith(['/organization/credentials']);
        expect(reloadSpy).toHaveBeenCalled();
      },
    });
  
    tick();
  }));
  
  
  
  it('should sign credential, open success dialog, navigate, and reload page', fakeAsync(() => {
    service.procedureId$.set('456');
  
    const signCredentialMock = jest
      .spyOn(mockCredentialProcedureService, 'signCredential')
      .mockReturnValue(of(undefined));
  
    const dialogRefMock = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest.spyOn(mockDialogWrapperService, 'openDialog').mockReturnValue(dialogRefMock as any);
  
    const routerNavigateSpy = jest.spyOn(mockRouter, 'navigate').mockResolvedValue(true);
    const locationReloadSpy = jest.spyOn(globalThis.location, 'reload').mockImplementation(() => {});
  
    service.signCredential().subscribe();
  
    tick();
  
    expect(signCredentialMock).toHaveBeenCalledWith('456');
  
    const expectedDialogData: DialogData = {
      title: TestBed.inject(TranslateService).instant("credentialDetails.signCredentialSuccess.title"),
      message: TestBed.inject(TranslateService).instant("credentialDetails.signCredentialSuccess.message"),
      confirmationType: 'none',
      status: 'default',
    };
  
    expect(mockDialogWrapperService.openDialog).toHaveBeenCalledWith(expectedDialogData);
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/organization/credentials']);
    expect(locationReloadSpy).toHaveBeenCalled();
  }));
});
