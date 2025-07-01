// add-asterisk.directive.spec.ts
import { AddAsteriskDirective } from './add-asterisk.directive';
import { ElementRef, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

describe('AddAsteriskDirective', () => {
  let directive: AddAsteriskDirective;
  let element: HTMLElement;
  let renderer: Renderer2;
  let formGroup: FormGroup;

  beforeEach(() => {
    // Creem un element dummy
    element = document.createElement('label');
    element.textContent = 'myLabel';
    
    // Mock mínim del Renderer2
    const mockRenderer: Partial<Renderer2> = {
      createText: jest.fn((value: string) => document.createTextNode(value)),
      appendChild: jest.fn((parent: any, newChild: any) => parent.appendChild(newChild)),
      // Stubs per satisfer la interfície abstracta
      destroy: jest.fn(),
      insertBefore: jest.fn(),
      removeChild: jest.fn(),
      selectRootElement: jest.fn(),
      setProperty: jest.fn(),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      addClass: jest.fn(),
      removeClass: jest.fn(),
      setStyle: jest.fn(),
      removeStyle: jest.fn(),
      setValue: jest.fn(),
      listen: jest.fn(),
    };
    renderer = mockRenderer as Renderer2;

    directive = new AddAsteriskDirective(new ElementRef(element), renderer);

    formGroup = new FormGroup({});
    directive.formGroup = formGroup;
    directive.controlName = 'name';
  });

  it('should add asterisk in required controls', () => {
    const control = new FormControl('', Validators.required);
    formGroup.addControl('name', control);
    control.setErrors({ required: true });

    directive.ngOnInit();

    expect(renderer.createText).toHaveBeenCalledWith(' *');
    expect(renderer.appendChild).toHaveBeenCalledWith(element, expect.any(Text));
    expect(element.textContent).toBe('myLabel *');
  });

  it('should not add asterisk when not required', () => {
    const control = new FormControl('');
    formGroup.addControl('name', control);

    directive.ngOnInit();

    expect(renderer.createText).not.toHaveBeenCalled();
    expect(element.textContent).toBe('myLabel');
  });

  it('warn if cannot find control in group', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    directive.formGroup = new FormGroup({});

    directive.ngOnInit();

    expect(warnSpy).toHaveBeenCalledWith(`Control 'name' not found in FormGroup`);
    warnSpy.mockRestore();
  });
});
