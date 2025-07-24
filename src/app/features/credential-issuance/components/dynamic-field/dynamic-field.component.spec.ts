import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { ComponentRef } from '@angular/core';
import { DynamicFieldComponent } from './dynamic-field.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

const mockControl = new FormControl('value');
const mockGroup = new FormGroup({ prop: mockControl });
const mockControlSchema = { type: 'control' } as any;
const mockGroupSchema = { type: 'group', fields: [{ key: 'fieldOne' }] } as any;

describe('DynamicFieldComponent', () => {
  let component: DynamicFieldComponent;
  let fixture: ComponentFixture<DynamicFieldComponent>;
  let componentRef: ComponentRef<DynamicFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DynamicFieldComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFieldComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('parentFormGroup$', mockGroup);
    componentRef.setInput('fieldName$', 'prop');
    componentRef.setInput('fieldSchema$', mockControlSchema);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('computed properties', () => {
    it('parentFormGroup$() should return the FormGroup passed via parentFormGroup$', () => {
      expect(component.parentFormGroup$()).toBe(mockGroup);
    });

    it('controlSchema$() should return null if the type is group', () => {
      componentRef.setInput('fieldSchema$', mockGroupSchema);
      expect(component.controlSchema$()).toBeNull();
    });

    it('controlSchema$() should return the schema when the type is control', () => {
      expect(component.controlSchema$()).toBe(mockControlSchema);
    });

    it('groupSchema$() should return null if the type is control', () => {
      expect(component.groupSchema$()).toBeNull();
    });

    it('groupSchema$() should return the schema when the type is group', () => {
      componentRef.setInput('fieldSchema$', mockGroupSchema);
      expect(component.groupSchema$()).toBe(mockGroupSchema);
    });

    it('childControl$() should return the FormControl when type is control', () => {
      expect(component.childControl$()).toBe(mockControl);
    });

    it('childControl$() should throw if the parent group is null', () => {
      componentRef.setInput('parentFormGroup$', null);
      expect(() => component.childControl$()).toThrow();
    });

    it('childGroup$() should return null when type is control', () => {
      expect(component.childGroup$()).toBeNull();
    });

    it('childGroup$() should return the FormGroup when the field is a nested FormGroup', () => {
      const nestedGroup = new FormGroup({ inner: new FormControl('') });
      const wrapper = new FormGroup({ prop: nestedGroup });
      componentRef.setInput('parentFormGroup$', wrapper);
      componentRef.setInput('fieldSchema$', mockGroupSchema);
      expect(component.childGroup$()).toBe(nestedGroup);
    });

    it('childGroup$() should return null if the field is not a FormGroup', () => {
      componentRef.setInput('fieldSchema$', mockGroupSchema);
      expect(component.childGroup$()).toBeNull();
    });
  });

  describe('getErrorMessage', () => {
    it('should return empty string if control is null', () => {
      expect(component.getErrorMessage(null)).toBe('');
    });

    it('should return empty string if control has no errors', () => {
      const ctrl = new FormControl();
      expect(component.getErrorMessage(ctrl)).toBe('');
    });

    it('should return the value property of the first error', () => {
      const ctrl = new FormControl();
      ctrl.setErrors({ customError: { value: 'Error occurred', args: [] } });
      expect(component.getErrorMessage(ctrl)).toBe('Error occurred');
    });
  });

  describe('getErrorsArgs', () => {
    it('should return empty object if control is null', () => {
      expect(component.getErrorsArgs(null)).toEqual({});
    });

    it('should return empty object if control has no errors', () => {
      const ctrl = new FormControl();
      expect(component.getErrorsArgs(ctrl)).toEqual({});
    });

    it('should return empty object if error has no args', () => {
      const ctrl = new FormControl();
      ctrl.setErrors({ err: { value: 'Error', args: [] } });
      expect(component.getErrorsArgs(ctrl)).toEqual({});
    });

    it('should map args array to numeric keys in the returned object', () => {
      const ctrl = new FormControl();
      ctrl.setErrors({ err: { value: 'Error', args: ['first', 'second'] } });
      expect(component.getErrorsArgs(ctrl)).toEqual({ '0': 'first', '1': 'second' });
    });
  });
});
