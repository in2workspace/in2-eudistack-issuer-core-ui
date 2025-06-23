import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { ComponentRef, signal, Signal } from '@angular/core';
import { DynamicFieldComponent } from './dynamic-field.component';
import { CredentialIssuanceFormFieldSchema } from 'src/app/core/models/schemas/lear-credential-issuance-schemas';

  const mockGroup = new FormGroup({prop: new FormControl('value')});
  const mockControl = new FormControl('field-name');

describe('DynamicFieldComponent', () => {
  let component: DynamicFieldComponent;
  let fixture: ComponentFixture<DynamicFieldComponent>;
  let componentRef: ComponentRef<DynamicFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DynamicFieldComponent,
        ReactiveFormsModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFieldComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('abstractControl$', mockGroup);
    componentRef.setInput('fieldName$', mockControl);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('computed properties', () => {
    it('parentFormGroup$() hauria de retornar el FormGroup passat per abstractControl$', () => {
      expect(component.parentFormGroup$()).toBe(mockGroup);
    });

    it('control$() hauria de retornar el control de formgroup', () => {
      expect(component.control$()).toBe(mockControl);
    });
    it('control$() retorna un FormControl dins del FormGroup', () => {
      const ctrl = new FormControl('value');
      const group = new FormGroup({ test: ctrl });

      (component as any).abstractControl$.set(group);
      (component as any).fieldName$.set('test');

      expect(component.control$()).toBe(ctrl);
    });

    it('group$() retorna un FormGroup fill dins del FormGroup', () => {
      const subgroup = new FormGroup({});
      const group = new FormGroup({ grp: subgroup });

      (component as any).abstractControl$ = signal(group) as Signal<AbstractControl>;
      (component as any).fieldName$ = signal('grp') as Signal<string>;
      (component as any).fieldSchema$ = signal({ type: 'text' } as any);

      expect(component.group$()).toBe(subgroup);
      expect(component.control$()).toBeNull();
    });

    it('groupFields$() retorna els camps d’un esquema de tipus "group"', () => {
      const schema = {
        type: 'group',
        groupFields: {
          a: { type: 'text' },
          b: { type: 'number' }
        }
      } as any;

      (component as any).fieldSchema$ = signal(schema);
      (component as any).abstractControl$ = signal(new FormGroup({})) as Signal<AbstractControl>;
      (component as any).fieldName$ = signal('') as Signal<string>;

      const fields = component.groupFields$();
      expect(fields).toEqual([
        { key: 'a', value: { type: 'string' } },
        { key: 'b', value: { type: 'number' } }
      ]);
    });
  });

  describe('helpers d’errors', () => {
    it('getErrorMessage() retorna el valor d’error per defecte', () => {
      const ctrl = { errors: { required: { value: 'Camp obligatori' } } } as any;
      expect(component.getErrorMessage(ctrl)).toBe('Camp obligatori');
    });

    it('getErrorMessage() amb control null o sense errors retorna cadena buida', () => {
      expect(component.getErrorMessage(null)).toBe('');
      expect(component.getErrorMessage({} as AbstractControl)).toBe('');
    });

    it('getErrorsArgs() retorna els arguments traduïts correctament', () => {
      const ctrl = {
        errors: {
          custom: {
            value: 'Err',
            args: ['uno', 'dos']
          }
        }
      } as any;
      expect(component.getErrorsArgs(ctrl)).toEqual({ '0': 'uno', '1': 'dos' });
    });

    // it('getErrorsArgs() amb control null o sense errors retorna objecte buit', () => {
    //   expect(component.getErrorsArgs(null)).toEqual({});
    //   expect(component.getErrorsArgs({ errors: {} } as any)).toEqual({});
    // });
  });
});
