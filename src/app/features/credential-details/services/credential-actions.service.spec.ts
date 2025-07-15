import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CredentialActionsService } from './credential-actions.service';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';

describe('CredentialActionsService', () => {
  let service: CredentialActionsService;
  let mockCredentialProcedure: Partial<CredentialProcedureService>;
  let mockDialog: Partial<DialogWrapperService>;
  let mockRouter: Partial<Router>;
  let mockTranslate: Partial<TranslateService>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockCredentialProcedure = {
      sendReminder: jest.fn().mockReturnValue(of(void 0)),
      signCredential: jest.fn().mockReturnValue(of(void 0)),
      revokeCredential: jest.fn().mockReturnValue(of(void 0)),
    };

    const afterClosedSpy = jest.fn().mockReturnValue(of(true));
    mockDialog = {
      openDialogWithCallback: jest.fn(),
      openDialog: jest.fn().mockReturnValue({ afterClosed: afterClosedSpy }),
    };

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    };

    mockTranslate = {
      instant: jest.fn().mockImplementation((key: string) => key),
    };

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Override window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        CredentialActionsService,
        { provide: CredentialProcedureService, useValue: mockCredentialProcedure },
        { provide: DialogWrapperService, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslate },
      ],
    });

    service = TestBed.inject(CredentialActionsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openSendReminderDialog', () => {
    it('should call openDialogWithCallback with correct DialogData', () => {
      const procedureId = 'proc123';
      service.openSendReminderDialog(procedureId);
      expect(mockDialog.openDialogWithCallback).toHaveBeenCalledTimes(1);
      const [dialogData, callback] = (mockDialog.openDialogWithCallback as jest.Mock).mock.calls[0];
      expect(dialogData.title).toBe('credentialDetails.sendReminderConfirm.title');
      expect(dialogData.message).toBe('credentialDetails.sendReminderConfirm.message');
      expect(dialogData.confirmationType).toBe('async');
      expect(typeof callback).toBe('function');
    });
  });

  describe('openSignCredentialDialog', () => {
    it('should call openDialogWithCallback with correct DialogData', () => {
      const procedureId = 'proc456';
      service.openSignCredentialDialog(procedureId);
      expect(mockDialog.openDialogWithCallback).toHaveBeenCalledTimes(1);
      const [dialogData, callback] = (mockDialog.openDialogWithCallback as jest.Mock).mock.calls[0];
      expect(dialogData.title).toBe('credentialDetails.signCredentialConfirm.title');
      expect(dialogData.message).toBe('credentialDetails.signCredentialConfirm.message');
      expect(dialogData.confirmationType).toBe('async');
      expect(typeof callback).toBe('function');
    });
  });

  describe('openRevokeCredentialDialog', () => {
    it('should call openDialogWithCallback with correct DialogData', () => {
      const credentialId = 'cred789';
      const credentialList = 'listXYZ';
      service.openRevokeCredentialDialog(credentialId, credentialList);
      expect(mockDialog.openDialogWithCallback).toHaveBeenCalledTimes(1);
      const [dialogData, callback] = (mockDialog.openDialogWithCallback as jest.Mock).mock.calls[0];
      expect(dialogData.title).toBe('credentialDetails.revokeCredentialConfirm.title');
      expect(dialogData.message).toBe('credentialDetails.revokeCredentialConfirm.message');
      expect(dialogData.confirmationType).toBe('async');
      expect(typeof callback).toBe('function');
    });
  });

  describe('executeCredentialProcedureAction', () => {
    it('should error and return EMPTY if no procedureId', done => {
      const result$ = service['executeCredentialProcedureAction']('', jest.fn(), 'tKey', 'mKey');
      result$.subscribe({
        complete: () => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('No procedure id.');
          done();
        }
      });
    });

    it('should execute full flow on valid procedureId', done => {
      const procId = 'procABC';
      const actionSpy = jest.fn().mockReturnValue(of(void 0));
      const titleKey = 'titleKey';
      const messageKey = 'messageKey';

      service['executeCredentialProcedureAction'](procId, actionSpy, titleKey, messageKey)
        .subscribe((res) => {
          expect(actionSpy).toHaveBeenCalledWith(procId);
          expect(mockDialog.openDialog).toHaveBeenCalledWith(expect.objectContaining({ title: titleKey, message: messageKey }));
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/organization/credentials']);
          expect(window.location.reload).toHaveBeenCalled();
          expect(res).toBe(true);
          done();
        });
    });
  });

  describe('executeCredentialAction', () => {
    it('should error and return EMPTY if no credentialId', done => {
      const result$ = service['executeCredentialAction']('', jest.fn(), 'tKey', 'mKey');
      result$.subscribe({
        complete: () => {
          expect(consoleErrorSpy).toHaveBeenCalledWith("Couldn't get credential list from credential.");
          done();
        }
      });
    });

    it('should execute full flow on valid credentialId', done => {
      const credId = 'credDEF';
      const actionSpy = jest.fn().mockReturnValue(of(void 0));
      const titleKey = 'tKey2';
      const messageKey = 'mKey2';

      service['executeCredentialAction'](credId, actionSpy, titleKey, messageKey)
        .subscribe((res) => {
          expect(actionSpy).toHaveBeenCalledWith(credId);
          expect(mockDialog.openDialog).toHaveBeenCalledWith(expect.objectContaining({ title: titleKey, message: messageKey }));
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/organization/credentials']);
          expect(window.location.reload).toHaveBeenCalled();
          expect(res).toBe(true);
          done();
        });
    });
  });

  describe('sendReminder, signCredential, revokeCredential', () => {
    it('sendReminder should call credentialProcedureService.sendReminder', done => {
      (service as any).sendReminder('xyz').subscribe(() => {
        expect(mockCredentialProcedure.sendReminder).toHaveBeenCalledWith('xyz');
        done();
      });
    });

    it('signCredential should call credentialProcedureService.signCredential', done => {
      (service as any).signCredential('uvw').subscribe(() => {
        expect(mockCredentialProcedure.signCredential).toHaveBeenCalledWith('uvw');
        done();
      });
    });

    it('revokeCredential should call credentialProcedureService.revokeCredential', done => {
      (service as any).revokeCredential('abc', 'list1').subscribe(() => {
        expect(mockCredentialProcedure.revokeCredential).toHaveBeenCalledWith('abc', 'list1');
        done();
      });
    });
  });
});
