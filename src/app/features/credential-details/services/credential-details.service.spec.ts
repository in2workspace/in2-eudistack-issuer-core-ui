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

describe('loadCredentialModels', () => {
  it('ha de cridar getCredentialProcedureById, setear senyals i models', fakeAsync(() => {
    // prepara
    service.procedureId$.set('pid-123');

    const fakeDetails = {
      credential: {
        vc: {
          validFrom: '2025-02-02',
          validUntil: '2025-03-03',
          type: ['LEARCredentialEmployee'],
          customField: 'valorX',            // perquè el schema fake llegeixi c.customField
        }
      },
      credential_status: 'APPROVED'
    } as any;

    jest.spyOn(mockCredentialProcedureService, 'getCredentialProcedureById')
      .mockReturnValue(of(fakeDetails));

    // schema i spies
    const fakeSchema = {
      main: [{
        type: 'key-value',
        key: 'cf',
        value: (c: any) => c.customField,
        custom: undefined
      }],
      side: []
    };
    const getSchemaSpy = jest
      .spyOn(service as any, 'getSchemaByType')
      .mockReturnValue(fakeSchema);

    const extendSpy = jest
      .spyOn(service as any, 'extendFields')
      .mockImplementation((...args: unknown[]) => args[0]); // el primer arg és l'array de fields

    // acció
    service.loadCredentialModels(TestBed.inject(Injector));
    tick();

    // asserts de senyals
    expect(service.credentialValidFrom$()).toBe('2025-02-02');
    expect(service.credentialValidUntil$()).toBe('2025-03-03');
    expect(service.credentialType$()).toBe('LEARCredentialEmployee');
    expect(service.credentialStatus$()).toBe('APPROVED');

    // assegura que getSchemaByType es crida amb el tipus correcte
    expect(getSchemaSpy).toHaveBeenCalledWith('LEARCredentialEmployee');

    // models
    expect(service.mainTemplateModel$()).toEqual([{
      type: 'key-value',
      key: 'cf',
      value: 'valorX',    // el computed del value
      custom: undefined
    }]);
    expect(service.sideTemplateModel$()).toEqual([]);
  }));

  it('lança error si al schema li falta el tipus', fakeAsync(() => {
    service.procedureId$.set('pid-err');

    const badDetails = {
      credential: {
        vc: {
          validFrom: '2025-01-01',
          validUntil: '2025-01-02',
          type: [],   // cap tipus vàlid → getCredentialType throw
        }
      },
      credential_status: 'PEND_DOWNLOAD'
    } as any;

    jest.spyOn(mockCredentialProcedureService, 'getCredentialProcedureById')
      .mockReturnValue(of(badDetails));

    // com que el throw està dins el subscribe, cal cridar tick() abans d'esperar-lo
    expect(() => {
      service.loadCredentialModels(TestBed.inject(Injector));
      tick();
    }).toThrowError('No credential tyep found in credential');  // fixa't en el "tyep"
  }));
});

  describe('mapFieldMain / mapFieldNullable', () => {
    const credStub = { foo: 'bar' } as any;

    it('mapFieldMain fa mapping de key-value i groups', () => {
      // key-value
      const kv = {
        type: 'key-value',
        key: 'x',
        value: (c: any) => 'valX',
        custom: { token: 'T', component: class{}, value: 'V' }
      } as any;
      const mappedKv = (service as any).mapFieldMain(kv, credStub);
      expect(mappedKv.value).toBe('valX');
      expect(mappedKv.custom!.value).toBe('V');

      // group
      const grp = {
        type: 'group',
        key: 'g',
        value: (c: any) => [{ type: 'key-value', key: 'y', value: 'valY' }],
        custom: undefined
      } as any;
      const mappedGrp = (service as any).mapFieldMain(grp, credStub);
      expect(Array.isArray(mappedGrp.value)).toBe(true);
      expect((mappedGrp.value as any[])[0].value).toBe('valY');
    });

    it('mapFieldNullable retorna null si el valor és falsy o grup buit', () => {
      // key-value falsy
      const kvFalsy = { type: 'key-value', key: 'k', value: () => '', custom: undefined } as any;
      expect((service as any).mapFieldNullable(kvFalsy, credStub)).toBeNull();

      // group buit
      const grpEmpty = { type: 'group', key: 'g', value: () => [], custom: undefined } as any;
      expect((service as any).mapFieldNullable(grpEmpty, credStub)).toBeNull();
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
});
