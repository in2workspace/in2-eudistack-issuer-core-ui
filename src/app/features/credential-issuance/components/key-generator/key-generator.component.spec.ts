import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { KeyGeneratorComponent } from './key-generator.component';
import { KeyGeneratorService } from '../../services/key-generator.service';
import { signal, WritableSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { KeyState } from 'src/app/core/models/entity/lear-credential-issuance';
import { FormGroup } from '@angular/forms';

describe('KeyGeneratorComponent', () => {
  let component: KeyGeneratorComponent;
  let fixture: ComponentFixture<KeyGeneratorComponent>;
  let mockService: Partial<KeyGeneratorService>;
  let rawStateSignal: WritableSignal<KeyState | undefined>;
  let displayedSignal: WritableSignal<Partial<KeyState> | undefined>;

  beforeEach(async () => {
    rawStateSignal = signal(undefined);
    displayedSignal = signal({ desmosPrivateKeyValue: undefined });

    mockService = {
      getState: () => rawStateSignal,
      displayedKeys$: displayedSignal,
      generateP256: jest.fn().mockResolvedValue(undefined),
    };

    // Stub updateMessages al prototype per evitar NG0950 de "required Input"
    Object.defineProperty(
      KeyGeneratorComponent.prototype,
      'updateMessages',
      {
        configurable: true,
        writable: true,
        value: () => () => {}
      }
    );

    await TestBed
      .configureTestingModule({
        imports: [KeyGeneratorComponent, TranslateModule.forRoot()]
      })
      .overrideComponent(KeyGeneratorComponent, {
        set: {
          providers: [
            { provide: KeyGeneratorService, useValue: mockService }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(KeyGeneratorComponent);
    component = fixture.componentInstance;
  });

  it('hauria de crear el component', () => {
    expect(component).toBeTruthy();
  });

  it('inicialment keyState$ i displayedKeys$ provenen del servei', () => {
    expect(component.keyState$()).toBeUndefined();
    expect(component.displayedKeys$()).toEqual({ desmosPrivateKeyValue: undefined });
  });

  it('ngOnInit ha de cridar updateAlertMessages', () => {
    const spy = jest.spyOn(component, 'updateAlertMessages').mockImplementation(() => {});
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('updateAlertMessages ha de cridar la funció stubbed per updateMessages', () => {
    const updateSpy = jest.fn();
    Object.defineProperty(component, 'updateMessages', {
      configurable: true,
      value: () => updateSpy
    });

    component.updateAlertMessages();
    expect(updateSpy).toHaveBeenCalledWith(['error.form.no_key']);
  });

  it('generateKeys ha de cridar generateP256 i parchejar el form amb el didKey', async () => {
    const fakeState: KeyState = {
      desmosDidKeyValue: 'DID-123',
      desmosPrivateKeyValue: 'PRIV'
    };
    rawStateSignal.set(fakeState);

    const fakeForm = { patchValue: jest.fn() } as unknown as FormGroup<any>;
    Object.defineProperty(component, 'form', {
      configurable: true,
      value: () => fakeForm
    });

    // Stub updateAlertMessages per evitar l'error NG0950
    jest.spyOn(component, 'updateAlertMessages').mockImplementation(() => {});

    await component.generateKeys();

    expect(mockService.generateP256).toHaveBeenCalled();
    expect(fakeForm.patchValue).toHaveBeenCalledWith({ didKey: 'DID-123' });
  });

  it('copyToClipboard escriu al clipboard i reseteja copiedKey després de 2s', fakeAsync(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      writable: true
    });
    const writeSpy = jest.spyOn(navigator.clipboard, 'writeText');

    component.copyToClipboard('test-key');

    expect(writeSpy).toHaveBeenCalledWith('test-key');
    expect(component.copiedKey).toBe('test-key');

    tick(2000);
    expect(component.copiedKey).toBe('');
  }));

  it('resetCopiedKey ha de buidar copiedKey', () => {
    component.copiedKey = 'xxx';
    (component as any).resetCopiedKey();
    expect(component.copiedKey).toBe('');
  });
});
