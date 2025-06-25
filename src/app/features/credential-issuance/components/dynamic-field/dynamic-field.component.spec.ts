import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { ComponentRef, signal, Signal } from '@angular/core';
import { DynamicFieldComponent } from './dynamic-field.component';
import { CredentialIssuanceFormFieldSchema } from 'src/app/core/models/schemas/lear-credential-issuance-schemas';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

const mockControl = new FormControl('field-name');
const mockGroup = new FormGroup({prop: mockControl});
const mockControlSchema = { type: 'control' };
const mockGroupSchema = { type: 'group', fields: [{key:'fieldOne'}] };

describe('DynamicFieldComponent', () => {
  let component: DynamicFieldComponent;
  let fixture: ComponentFixture<DynamicFieldComponent>;
  let componentRef: ComponentRef<DynamicFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DynamicFieldComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(), NoopAnimationsModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFieldComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('abstractControl$', mockGroup);
    componentRef.setInput('fieldName$', 'prop');
    componentRef.setInput('fieldSchema$', mockControlSchema as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('computed properties', () => {
    it('parentFormGroup$() hauria de retornar el FormGroup passat per abstractControl$', () => {
      expect(component.parentFormGroup$()).toBe(mockGroup);
    });

    it('control$() hauria de retornar null si el tipus és group', () => {
      componentRef.setInput('fieldSchema$', mockGroupSchema);
      expect(component.control$()).toBe(null);
    });

    it('control$() hauria de retornar el control de formgroup', () => {
      expect(component.control$()).toBe(mockControl);
    });

    it('control$() hauria de retornar null si formgroup és nul', () => {
      componentRef.setInput('abstractControl$', null);
      expect(component.control$()).toBe(null);
    });

    it("group$() hauria de retornar null si el type és control", () => {
      expect(component.group$()).toBe(null);
    });

    it("group$() hauria de retornar null if parent group is null", () => {
      componentRef.setInput('fieldSchema$', mockGroupSchema);
      componentRef.setInput('abstractControl$', null);
      expect(component.group$()).toBe(null);
    });

    it("group$() hauria d'actualitzar-se", () => {
      componentRef.setInput('fieldSchema$', mockGroupSchema);
      expect(component.group$()).toBe(mockControl);
    });
  });

  //todo getters
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
