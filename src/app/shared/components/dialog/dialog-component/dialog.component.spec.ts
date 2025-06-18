import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { DialogComponent, DialogData } from './dialog.component';
import { LoaderService } from 'src/app/core/services/loader.service';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let mockDialogRef: jest.Mocked<MatDialogRef<DialogComponent>>;
  let mockLoaderService: jest.Mocked<LoaderService>;

  const mockData: DialogData = {
    title: 'Test Title',
    message: 'Test Message',
    confirmationType: 'sync',
    status: 'default'
  };

  beforeEach(() => {
    mockDialogRef = {
      close: jest.fn(),
      addPanelClass: jest.fn(),
      removePanelClass: jest.fn(),
    } as unknown as jest.Mocked<MatDialogRef<DialogComponent>>;

    mockLoaderService = {
      isLoading$: of(false),
    } as unknown as jest.Mocked<LoaderService>;

    TestBed.configureTestingModule({
      providers: [
        DialogComponent,
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: LoaderService, useValue: mockLoaderService },
      ],
    });

    component = TestBed.inject(DialogComponent);
    jest.spyOn(component, 'updateStatus');
  });

  afterEach(() => {
    jest.resetAllMocks(); 
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the provided data', () => {
    expect(component.data).toEqual(mockData);
    expect(component.currentStatus).toEqual(mockData.status);
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-custom');
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith(`dialog-${mockData.status}`);
  });

  it('should update status correctly in updateStatus', () => {
    jest.spyOn(component, 'updateStatusPanelClass');
    jest.spyOn(component, 'updateStatusColor');

    component.currentStatus = 'error';

    component.updateStatus();

    // Verify the calls to updateStatusPanelClass and updateStatusColor
    expect(component.updateStatusPanelClass).toHaveBeenCalledWith('error');
    expect(component.updateStatusColor).toHaveBeenCalled();
    expect(component.currentStatus).toEqual(mockData.status);

  });

  it('should set the correct status color in updateStatusColor', () => {
    component.currentStatus = 'default';
    component.updateStatusColor();
    expect(component.statusColor).toEqual('primary');

    component.currentStatus = 'error';
    component.updateStatusColor();
    expect(component.statusColor).toEqual('warn');
  });

  it('should update panel class correctly in updateStatusPanelClass', () => {
    component.currentStatus = 'default';
    component.updateStatusPanelClass('error');
    expect(mockDialogRef.removePanelClass).toHaveBeenCalledWith('dialog-error');
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-default');

    component.currentStatus = 'error';
    component.updateStatusPanelClass('default');
    expect(mockDialogRef.removePanelClass).toHaveBeenCalledWith('dialog-error');
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-default');
  });

  it('should update the dialog data', () => {
    component.updateData({ status: 'error' });

    expect(mockDialogRef.removePanelClass).toHaveBeenCalledWith('dialog-default');
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-error');
    expect(component.currentStatus).toEqual('error');
  });

  it('should close the dialog with true on confirm for sync type', () => {
    component.onConfirm();

    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should emit confirmation without closing for async type', () => {
    const confirmSpy = jest.spyOn(component['confirmSubj$'], 'next');
    component.updateData({ confirmationType: 'async' });
    component.onConfirm();

    expect(confirmSpy).toHaveBeenCalledWith(true);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close the dialog with false on cancel', () => {
    component.onCancel();

    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should return an observable from afterConfirm$', (done) => {
    component.afterConfirm$().subscribe((result) => {
      expect(result).toBe(true);
      done();
    });

    component['confirmSubj$'].next(true);
  });
});
