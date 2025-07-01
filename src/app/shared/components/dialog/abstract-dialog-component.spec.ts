import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseDialogData, DialogStatus } from './dialog-data';
import { AbstractDialogComponent } from './abstract-dialog-component';

interface TestData extends BaseDialogData {}

class TestDialogComponent extends AbstractDialogComponent<TestData> {}

describe('AbstractDialogComponent', () => {
  let component: TestDialogComponent;
  let mockDialogRef: jest.Mocked<MatDialogRef<TestDialogComponent>>;

  const mockData = { status: 'default' } as TestData;

  beforeEach(() => {
    mockDialogRef = {
      close: jest.fn(),
      addPanelClass: jest.fn(),
      removePanelClass: jest.fn(),
    } as unknown as jest.Mocked<MatDialogRef<TestDialogComponent>>;

    TestBed.configureTestingModule({
      providers: [
        TestDialogComponent,
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    });

    component = TestBed.inject(TestDialogComponent);
    jest.spyOn(component, 'updateStatus');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided data and panel classes', () => {
    // data assignment
    expect(component.data).toEqual(mockData);
    // status inicial
    expect(component.currentStatus).toEqual('default');
    // classe per defecte
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-custom');
    // classe per status
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-default');
  });

  it('should recalculate status in updateStatus()', () => {
    jest.spyOn(component as any, 'updateStatusPanelClass');
    jest.spyOn(component as any, 'updateStatusColor');
    // forcem un estat anterior diferent
    component.currentStatus = 'error';
    component.updateStatus();
    expect((component as any).updateStatusPanelClass).toHaveBeenCalledWith('error');
    expect((component as any).updateStatusColor).toHaveBeenCalled();
    expect(component.currentStatus).toEqual(mockData.status);
  });

  it('should set correct statusColor in updateStatusColor()', () => {
    component.currentStatus = 'default';
    (component as any).updateStatusColor();
    expect(component.statusColor).toBe('primary');

    component.currentStatus = 'error';
    (component as any).updateStatusColor();
    expect(component.statusColor).toBe('warn');
  });

  it('should manage panel classes in updateStatusPanelClass()', () => {
    component.currentStatus = 'default';
    (component as any).updateStatusPanelClass('error');
    expect(mockDialogRef.removePanelClass).toHaveBeenCalledWith('dialog-error');
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-default');

    // altres direccions
    component.currentStatus = 'error';
    (component as any).updateStatusPanelClass('default');
    expect(mockDialogRef.removePanelClass).toHaveBeenCalledWith('dialog-default');
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-error');
  });

  it('should patch data and refresh status in updateData()', () => {
    // netegem qualsevol classe anterior
    mockDialogRef.removePanelClass.mockClear();
    mockDialogRef.addPanelClass.mockClear();

    component.updateData({ status: 'error' });

    expect(component.data.status).toBe('error');
    expect(component.currentStatus).toBe('error');
    expect(mockDialogRef.removePanelClass).toHaveBeenCalledWith('dialog-default');
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-error');
  });

  it('should emit through afterConfirm$()', done => {
    component.afterConfirm$().subscribe(value => {
      expect(value).toBe(true);
      done();
    });
    (component as any).confirmSubject$.next(true);
  });

  it('should emit and close on onConfirm()', () => {
    const nextSpy = jest.spyOn((component as any).confirmSubject$, 'next');
    component.onConfirm();
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close with false on onCancel()', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('getEmbeddedInstance() should return null by default', () => {
    expect(component.getEmbeddedInstance<any>()).toBeNull();
  });

  it('getDefaultStyle() should return "dialog-custom"', () => {
    expect((component as any).getDefaultStyle()).toBe('dialog-custom');
  });
});
