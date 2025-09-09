// conditional-confirm-dialog.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConditionalConfirmDialogComponent } from './conditional-confirm-dialog.component';
import { ConditionalConfirmDialogData } from '../dialog-data';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { of } from 'rxjs';

describe('ConditionalConfirmDialogComponent', () => {
  let component: ConditionalConfirmDialogComponent;
  let mockDialogRef: jest.Mocked<MatDialogRef<ConditionalConfirmDialogComponent>>;
  let mockLoaderService: jest.Mocked<LoaderService>;

  const mockData: ConditionalConfirmDialogData = {
    title: 'Test Title',
    message: 'Test Message',
    status: 'default',
    confirmationType: 'sync',
    checkboxLabel: 'I agree',
  };

  beforeEach(() => {
    mockDialogRef = {
      close: jest.fn(),
      addPanelClass: jest.fn(),
      removePanelClass: jest.fn(),
    } as unknown as jest.Mocked<MatDialogRef<ConditionalConfirmDialogComponent>>;

    mockLoaderService = {
      isLoading$: of(true),
    } as unknown as jest.Mocked<LoaderService>;

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        ConditionalConfirmDialogComponent,
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: LoaderService, useValue: mockLoaderService }
      ],
    });

    component = TestBed.inject(ConditionalConfirmDialogComponent);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose isLoading$ from LoaderService', () => {
    let loading: boolean | undefined;
    component.isLoading$.subscribe(v => (loading = v));
    expect(loading).toBe(true);
  });

  it('should add panel classes for default style and status in constructor', () => {
    // default style comes from overridden getDefaultStyle()
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('conditional-confirm');
    // then it applies dialog-default based on data.status
    expect(mockDialogRef.addPanelClass).toHaveBeenCalledWith('dialog-default');
  });

  it('getDefaultStyle() should return the overridden style', () => {
    // access protected method via casting
    expect((component as any).getDefaultStyle()).toBe('conditional-confirm');
  });

  it('toggleCheckbox() should update the checkboxChecked signal', () => {
    // initial value should be false
    expect(component.checkboxChecked()).toBe(false);

    component.toggleCheckbox(true);
    expect(component.checkboxChecked()).toBe(true);

    component.toggleCheckbox(false);
    expect(component.checkboxChecked()).toBe(false);
  });

  describe('onConfirm()', () => {
    it('should not emit or close if checkbox is not checked', () => {
      const nextSpy = jest.spyOn((component as any).confirmSubject$, 'next');

      component.onConfirm();

      expect(nextSpy).not.toHaveBeenCalled();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should call super.onConfirm (emit + close) when checkbox is checked', () => {
      const nextSpy = jest.spyOn((component as any).confirmSubject$, 'next');

      // check the checkbox
      component.toggleCheckbox(true);
      component.onConfirm();

      // confirmSubject$.next(true) should have been called
      expect(nextSpy).toHaveBeenCalledWith(true);
      // dialogRef.close(true) should have been called
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });
  });
});
