import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError, Subject } from 'rxjs';
import { DialogWrapperService } from './dialog-wrapper.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DialogComponent } from '../dialog-component/dialog.component';
import { DialogData } from '../dialog-data';

jest.mock('@angular/material/dialog');

describe('DialogWrapperService', () => {
  let service: DialogWrapperService;
  let matDialogMock: jest.Mocked<MatDialog>;
  let loaderServiceMock: jest.Mocked<LoaderService>;

  beforeEach(() => {
    matDialogMock = {
      open: jest.fn(),
      openDialogs: []
    } as unknown as jest.Mocked<MatDialog>;

    loaderServiceMock = {
      updateIsLoading: jest.fn(),
    } as unknown as jest.Mocked<LoaderService>;

    TestBed.configureTestingModule({
      providers: [
        DialogWrapperService,
        { provide: MatDialog, useValue: matDialogMock },
        { provide: LoaderService, useValue: loaderServiceMock },
      ],
    });

    service = TestBed.inject(DialogWrapperService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should open a dialog with given data', () => {
    const dialogData: DialogData = {
      title: 'Sync Title',
      message: 'Sync Message',
      confirmationType: 'sync',
      status: 'default'
    };
    const mockDialogRef = {} as MatDialogRef<DialogComponent, any>;

    matDialogMock.open.mockReturnValue(mockDialogRef);

    const result = service.openDialog(DialogComponent, dialogData);

    expect(matDialogMock.open).toHaveBeenCalledWith(DialogComponent, {
      data: {
        ...dialogData
      },
      autoFocus: false
    });

    expect(result).toBe(mockDialogRef);
  });

  it('should open a dialog and execute the callback with sync confirmation type', () => {
    const dialogData: DialogData = {
      title: 'Sync Title',
      message: 'Sync Message',
      confirmationType: 'sync',
      status: 'default'
    };
    const callback = jest.fn(() => of('success'));
    const afterClosedSubject = new Subject<boolean>();
    const dialogRefMock = {
      afterClosed: jest.fn(() => afterClosedSubject.asObservable()),
      close: jest.fn(),
    } as unknown as MatDialogRef<DialogComponent, any>;

    matDialogMock.open.mockReturnValue(dialogRefMock);

    service.openDialogWithCallback(DialogComponent, dialogData, callback);

    afterClosedSubject.next(true);
    afterClosedSubject.complete();

    expect(matDialogMock.open).toHaveBeenCalledWith(DialogComponent, {
      data: { ...dialogData },
      autoFocus:false,
      disableClose: false
    });
    expect(callback).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should open a dialog and execute the callback with async confirmation type', () => {
    const dialogData: DialogData = {
      title: 'Async Title',
      message: 'Async Message',
      confirmationType: 'async',
      status: 'default',
      loadingData: { title: 'Loading', message: 'Loading Message' },
    };
    const callback = jest.fn(() => of('success'));
    const afterConfirmSubject = new Subject<true>();
    const dialogRefMock = {
      componentInstance: {
        afterConfirm$: jest.fn(() => afterConfirmSubject.asObservable()),
        updateData: jest.fn(),
      },
      close: jest.fn(),
    } as unknown as MatDialogRef<DialogComponent, any>;

    matDialogMock.open.mockReturnValue(dialogRefMock);

    service.openDialogWithCallback(DialogComponent, dialogData, callback);

    afterConfirmSubject.next(true);
    afterConfirmSubject.complete();

    expect(matDialogMock.open).toHaveBeenCalledWith(DialogComponent, {
      data: { ...dialogData },
      autoFocus:false,
      disableClose: false
    });
    expect(dialogRefMock.componentInstance.updateData).toHaveBeenCalledWith({ loadingData: dialogData.loadingData});
    expect(loaderServiceMock.updateIsLoading).toHaveBeenCalledWith(true);
    expect(callback).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should handle errors in the callback and keep dialog open', () => {
    const dialogData: DialogData = {
      title: 'Error Title',
      message: 'Error Message',
      confirmationType: 'sync',
      status: 'default'
    };
    const callback = jest.fn(() => throwError(() => new Error('Callback Error')));
    const afterClosedSubject = new Subject<boolean>();
    const dialogRefMock = {
      afterClosed: jest.fn(() => afterClosedSubject.asObservable()),
      close: jest.fn(),
    } as unknown as MatDialogRef<DialogComponent, any>;

    matDialogMock.open.mockReturnValue(dialogRefMock);

    service.openDialogWithCallback(DialogComponent, dialogData, callback);

    afterClosedSubject.next(true);
    afterClosedSubject.complete();

    expect(matDialogMock.open).toHaveBeenCalledWith(DialogComponent, {
      data: { ...dialogData },
      autoFocus:false,
      disableClose: false
    });
    expect(callback).toHaveBeenCalled();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
    expect(loaderServiceMock.updateIsLoading).toHaveBeenCalledWith(false);
  });

  
  it('should set disableClose to true when disableClose parameter is "DISABLE_CLOSE"', () => {
    const dialogData: DialogData = {
      title: 'Test Title',
      message: 'Test Message',
      confirmationType: 'sync',
      status: 'default'
    };
    const callback = jest.fn(() => of('success'));
    const afterClosedSubject = new Subject<boolean>();
    const dialogRefMock = {
      afterClosed: jest.fn(() => afterClosedSubject.asObservable()),
      close: jest.fn(),
    } as unknown as MatDialogRef<DialogComponent, any>;
  
    matDialogMock.open.mockReturnValue(dialogRefMock);
  
    service.openDialogWithCallback(DialogComponent, dialogData, callback, undefined, 'DISABLE_CLOSE');
  
    expect(matDialogMock.open).toHaveBeenCalledWith(DialogComponent, {
      data: { ...dialogData },
      autoFocus: false,
      disableClose: true  
    });
  });
  
  it('should reset disableClose to false after async callback execution', () => {
    const dialogData: DialogData = {
      title: 'Async Title',
      message: 'Async Message',
      confirmationType: 'async',
      status: 'default',
      loadingData: { title: 'Loading', message: 'Loading Message' },
    };
    const callback = jest.fn(() => of('success'));
    const afterConfirmSubject = new Subject<boolean>();
    const dialogRefMock = {
      componentInstance: {
        afterConfirm$: jest.fn(() => afterConfirmSubject.asObservable()),
        updateData: jest.fn(),
      },
      disableClose: false,
      close: jest.fn(),
    } as unknown as MatDialogRef<DialogComponent, any>;
  
    matDialogMock.open.mockReturnValue(dialogRefMock);
  
    service.openDialogWithCallback(DialogComponent, dialogData, callback);
  
    afterConfirmSubject.next(true);
    afterConfirmSubject.complete();
  
    expect(dialogRefMock.disableClose).toBe(false);
    expect(loaderServiceMock.updateIsLoading).toHaveBeenCalledWith(false);
  });
  
  it('should handle errors in the async callback and keep dialog open', () => {
    const dialogData: DialogData = {
      title: 'Async Error Title',
      message: 'Async Error Message',
      confirmationType: 'async',
      status: 'default',
      loadingData: { title: 'Loading', message: 'Loading Message' },
    };
    const callback = jest.fn(() => throwError(() => new Error('Async Callback Error')));
    const afterConfirmSubject = new Subject<boolean>();
    const dialogRefMock = {
      componentInstance: {
        afterConfirm$: jest.fn(() => afterConfirmSubject.asObservable()),
        updateData: jest.fn(),
      },
      disableClose: false,
      close: jest.fn(),
    } as unknown as MatDialogRef<DialogComponent, any>;
  
    matDialogMock.open.mockReturnValue(dialogRefMock);
  
    service.openDialogWithCallback(DialogComponent, dialogData, callback);
  
    afterConfirmSubject.next(true);
    afterConfirmSubject.complete();
  
    expect(matDialogMock.open).toHaveBeenCalledWith(DialogComponent, {
      data: { ...dialogData },
      autoFocus: false,
      disableClose: false
    });
    expect(callback).toHaveBeenCalled();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
    expect(loaderServiceMock.updateIsLoading).toHaveBeenCalledWith(false);
  });
  

  it('should execute cancel callback when dialog is closed with false', () => {
    const dialogData: DialogData = {
      title: 'Cancel Title',
      message: 'Cancel Message',
      confirmationType: 'sync',
      status: 'default'
    };
    
    const callback = jest.fn(() => of('success'));
    const cancelCallback = jest.fn(() => of('cancel success'));

    const afterClosedSubject = new Subject<boolean>();
    const dialogRefMock = {
      afterClosed: jest.fn(() => afterClosedSubject.asObservable()),
      close: jest.fn(),
    } as unknown as MatDialogRef<DialogComponent, any>;

    matDialogMock.open.mockReturnValue(dialogRefMock);

    service.openDialogWithCallback(DialogComponent, dialogData, callback, cancelCallback);

    afterClosedSubject.next(false);
    afterClosedSubject.complete();

    expect(matDialogMock.open).toHaveBeenCalledWith(DialogComponent, {
      data: { ...dialogData },
      autoFocus: false,
      disableClose: false
    });

    expect(cancelCallback).toHaveBeenCalled();
  });

  it('should handle errors in cancel callback', () => {
    const dialogData: DialogData = {
      title: 'Cancel Error Title',
      message: 'Cancel Error Message',
      confirmationType: 'sync',
      status: 'default'
    };

    const callback = jest.fn(() => of('success'));
    const cancelCallback = jest.fn(() => throwError(() => new Error('Cancel Callback Error')));

    const afterClosedSubject = new Subject<boolean>();
    const dialogRefMock = {
      afterClosed: jest.fn(() => afterClosedSubject.asObservable()),
      close: jest.fn(),
    } as unknown as MatDialogRef<DialogComponent, any>;

    matDialogMock.open.mockReturnValue(dialogRefMock);

    service.openDialogWithCallback(DialogComponent, dialogData, callback, cancelCallback);

    afterClosedSubject.next(false);
    afterClosedSubject.complete();

    expect(matDialogMock.open).toHaveBeenCalledWith(DialogComponent, {
      data: { ...dialogData },
      autoFocus: false,
      disableClose: false
    });

    expect(cancelCallback).toHaveBeenCalled();
  });

  it('should open a dialog and return dialogRef', () => {
    const dialogData: DialogData = {
      title: 'Test Title',
      message: 'Test Message',
      confirmationType: 'sync',
      status: 'default'
    };
    
    const callback = jest.fn(() => of('success'));
    const dialogRefMock = {
      afterClosed: jest.fn(() => of(true)),
      close: jest.fn(),
    } as unknown as MatDialogRef<DialogComponent, any>;
  
    matDialogMock.open.mockReturnValue(dialogRefMock);
  
    const result = service.openDialogWithCallback(DialogComponent, dialogData, callback);
  
    expect(matDialogMock.open).toHaveBeenCalledWith(DialogComponent, {
      data: { ...dialogData },
      autoFocus: false,
      disableClose: false
    });
  
    expect(result).toBe(dialogRefMock);
  });

  it('should open dialog and execute async operation with valid form', () => {
    const mockFormValue = { foo: 'bar' };
    const validateForm = jest.fn().mockReturnValue(true);
    const getFormValue = jest.fn().mockReturnValue(mockFormValue);
    const asyncOperation = jest.fn(() => of({}));
  
    const afterConfirmSubject = new Subject<void>();
    const embeddedInstanceMock = {
      isValid: jest.fn().mockReturnValue(true),
      getFormValue: jest.fn().mockReturnValue(mockFormValue)
    };
  
    const dialogRefMock = {
      componentInstance: {
        afterConfirm$: () => afterConfirmSubject.asObservable(),
        getEmbeddedInstance: jest.fn(() => embeddedInstanceMock)
      },
      close: jest.fn(),
      disableClose: true
    } as unknown as MatDialogRef<DialogComponent, any>;
  
    matDialogMock.open.mockReturnValue(dialogRefMock);
  
    const dialogData: DialogData = {
      title: 'Test Dialog',
      message: '',
      confirmationType: 'async',
      status: 'default',
    };
  
    const resultRef = service.openDialogWithForm(DialogComponent, 
      dialogData,
      validateForm,
      getFormValue,
      asyncOperation
    );
  
    afterConfirmSubject.next();
    afterConfirmSubject.complete();
  
    expect(matDialogMock.open).toHaveBeenCalledWith(DialogComponent, {
      data: { ...dialogData },
      autoFocus: false,
      disableClose: true,
    });
  
    expect(resultRef).toBe(dialogRefMock);
    expect(validateForm).toHaveBeenCalledWith(embeddedInstanceMock);
    expect(getFormValue).toHaveBeenCalledWith(embeddedInstanceMock);
    expect(asyncOperation).toHaveBeenCalledWith(mockFormValue);
    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(loaderServiceMock.updateIsLoading).toHaveBeenCalledWith(true);
    expect(loaderServiceMock.updateIsLoading).toHaveBeenCalledWith(false);
  });
  
  it('should not proceed if form is invalid and should mark it as touched', () => {
    const validateForm = jest.fn().mockReturnValue(false);
    const getFormValue = jest.fn();
    const asyncOperation = jest.fn();
  
    const afterConfirmSubject = new Subject<void>();
  
    const embeddedInstanceMock = {
      markTouched: jest.fn()
    };
  
    const dialogRefMock = {
      componentInstance: {
        afterConfirm$: () => afterConfirmSubject.asObservable(),
        getEmbeddedInstance: jest.fn(() => embeddedInstanceMock)
      },
      close: jest.fn()
    } as unknown as MatDialogRef<DialogComponent, any>;
  
    matDialogMock.open.mockReturnValue(dialogRefMock);
  
    const dialogData: DialogData = {
      title: 'Test Invalid',
      message: '',
      confirmationType: 'async',
      status: 'default',
    };
  
    service.openDialogWithForm(DialogComponent, dialogData, validateForm, getFormValue, asyncOperation);
  
    afterConfirmSubject.next();
    afterConfirmSubject.complete();
  
    expect(validateForm).toHaveBeenCalledWith(embeddedInstanceMock);
    expect(embeddedInstanceMock.markTouched).toHaveBeenCalled();
    expect(getFormValue).not.toHaveBeenCalled();
    expect(asyncOperation).not.toHaveBeenCalled();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
  
  
  
});
