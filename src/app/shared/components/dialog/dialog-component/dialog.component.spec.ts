// dialog.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { DialogComponent } from './dialog.component';
import { DialogData } from '../dialog-data';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let mockDialogRef: jest.Mocked<MatDialogRef<DialogComponent>>;
  let mockLoaderService: jest.Mocked<LoaderService>;

  const initialData: DialogData = {
    title: 'Test Title',
    message: 'Test Message',
    status: 'default',
    confirmationType: 'sync',
    template: {} as any,
    confirmationLabel: 'oldOk',
    cancelLabel: 'oldCancel',
  };

  beforeEach(() => {
    mockDialogRef = {
      close: jest.fn(),
      addPanelClass: jest.fn(),
      removePanelClass: jest.fn(),
    } as unknown as jest.Mocked<MatDialogRef<DialogComponent>>;

    mockLoaderService = {
      isLoading$: of(true),
    } as unknown as jest.Mocked<LoaderService>;

    TestBed.configureTestingModule({
      providers: [
        DialogComponent,
        { provide: MAT_DIALOG_DATA, useValue: initialData },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: LoaderService, useValue: mockLoaderService },
      ],
    });

    component = TestBed.inject(DialogComponent);
  });

  afterEach(() => jest.resetAllMocks());

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose isLoading$ from LoaderService', () => {
    let loading: boolean | undefined;
    component.isLoading$.subscribe(v => (loading = v));
    expect(loading).toBe(true);
  });

  it('should call addPanelClass for default style and status in ctor', () => {
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-custom');
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-default');
  });

  describe('updateData override', () => {
    it('should reset template and labels and update status', () => {
      mockDialogRef.removePanelClass.mockClear();
      mockDialogRef.addPanelClass.mockClear();

      component.updateData({
        status: 'error',
        template: {} as any,
        confirmationLabel: 'newOk',
        cancelLabel: 'newCancel',
      });

      expect(component.data.status).toBe('error');
      // segons la implementació, es refresca i manté el nou 'template' i labels
      expect(component.data.template).toEqual({} as any);
      expect(component.data.confirmationLabel).toBe('newOk');
      expect(component.data.cancelLabel).toBe('newCancel');

      expect(mockDialogRef.removePanelClass).toHaveBeenCalledWith('dialog-default');
      expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-error');
    });
  });

  describe('getEmbeddedInstance()', () => {
    it('should return the instance if attachedRef.instance exists', () => {
      const inst = { foo: 'bar' };
      component.portalOutlet = { attachedRef: { instance: inst } } as any;
      expect(component.getEmbeddedInstance<typeof inst>()).toBe(inst);
    });

    it('should return null if attachedRef is missing', () => {
      component.portalOutlet = {} as any;
      expect(component.getEmbeddedInstance()).toBeNull();
    });

    it('should return null if attachedRef has no instance', () => {
      component.portalOutlet = { attachedRef: {} } as any;
      expect(component.getEmbeddedInstance()).toBeNull();
    });
  });
});
