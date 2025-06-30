import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CredentialDetailsService } from './credential-details.service';
import { FormBuilder } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { of } from 'rxjs';
import { DialogData } from 'src/app/shared/components/dialog/dialog.component';
import { Injector } from '@angular/core';
import { GxLabelCredentialDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/gx-label-credential-details-schema';
import { LearCredentialEmployeeDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-employee-details-schema';
import { LearCredentialMachineDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-machine-details-schema';
import { VerifiableCertificationDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/verifiable-certification-details-schema';
import { DetailsKeyValueField, DetailsGroupField, TemplateSchema, MappedDetailsGroupField, MappedDetailsKeyValueField } from 'src/app/core/models/entity/lear-credential-details';

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

  describe('mapFieldMain', () => {
 it('should map “key-value” and “group” correctly', () => {
    const credStub = { foo: 'bar' } as any;

    const kv: DetailsKeyValueField = {
      type: 'key-value',
      key: 'x',
      value: (c: any) => 'valX',
      custom: {
        token: 'T' as any,
        component: class {},
        value: (c: any) => 'V'
      }
    };

    const grp: DetailsGroupField = {
      type: 'group',
      key: 'g',
      value: (c: any) => [
        { type: 'key-value', key: 'y', value: 'valY' }
      ] as DetailsKeyValueField[]
    };

    const kvGroup: DetailsGroupField = {
      type: 'group',
      key: 'gKv',
      value: [ kv ]
    };

    const schema: TemplateSchema = {
      main: [ kvGroup, grp ],
      side: []
    };

    const mapped = (service as any).mapSchemaValues(schema, credStub);

    const mappedGroup = mapped.main[0] as any;
    expect(mappedGroup.key).toBe('gKv');
    expect(Array.isArray(mappedGroup.value)).toBeTruthy();

    const mappedKv = mappedGroup.value[0] as any;
    expect(mappedKv.key).toBe('x');
    expect(mappedKv.value).toBe('valX');
    expect(mappedKv.custom!.value).toBe('V');

    const mappedDynGroup = mapped.main[1] as any;
    expect(mappedDynGroup.key).toBe('g');
    expect(Array.isArray(mappedDynGroup.value)).toBeTruthy();
    expect((mappedDynGroup.value[0] as any).value).toBe('valY');
  });
});

  describe('getSchemaByType', () => {
    it('retorna el schema correcte per cada tipus', () => {
      expect((service as any).getSchemaByType('LEARCredentialEmployee'))
        .toBe(LearCredentialEmployeeDetailsTemplateSchema);
      expect((service as any).getSchemaByType('LEARCredentialMachine'))
        .toBe(LearCredentialMachineDetailsTemplateSchema);
      expect((service as any).getSchemaByType('VerifiableCertification'))
        .toBe(VerifiableCertificationDetailsTemplateSchema);
      expect((service as any).getSchemaByType('gx:LabelCredential'))
        .toBe(GxLabelCredentialDetailsTemplateSchema);
    });
  });

describe('Load models', () => {
  it('should load and map credential models correctly', () => {
  const svc: any = service;

  jest.spyOn(svc, 'credentialType$').mockReturnValue('MyType');

  const vc = { foo: 'bar' };
  const mockData = { credential: { vc, type: 'MyType' } };
  jest.spyOn(svc, 'loadCredentialDetails').mockReturnValue(of(mockData));

  const basicInfoSpy = jest.spyOn(svc, 'setCredentialBasicInfo').mockImplementation(() => {});
  const getSchemaSpy   = jest.spyOn(svc, 'getSchemaByType').mockReturnValue({ schemaKey: 'schemaVal' });
  const mapped         = { mappedKey: 'mappedVal' };
  const mapSpy         = jest.spyOn(svc, 'mapSchemaValues').mockReturnValue(mapped);
  const templateSpy    = jest.spyOn(svc, 'setTemplateModels').mockImplementation(() => {});

  const injector = TestBed.inject(Injector);
  svc.loadCredentialModels(injector);

  expect(svc.loadCredentialDetails).toHaveBeenCalled();
  expect(basicInfoSpy).toHaveBeenCalledWith(mockData);
  expect(getSchemaSpy).toHaveBeenCalledWith('MyType');
  expect(mapSpy).toHaveBeenCalledWith({ schemaKey: 'schemaVal' }, vc);
  expect(templateSpy).toHaveBeenCalledWith(mapped, injector);
});
});

});
