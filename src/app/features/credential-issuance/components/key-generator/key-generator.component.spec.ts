import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { KeyGeneratorComponent } from './key-generator.component';
import { KeyGeneratorService } from '../../services/key-generator.service';
import { signal, WritableSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { KeyState } from 'src/app/core/models/entity/lear-credential-issuance';
import { FormGroup } from '@angular/forms';
import { CredentialIssuanceService } from '../../services/credential-issuance.service';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';

describe('KeyGeneratorComponent', () => {
  let component: KeyGeneratorComponent;
  let fixture: ComponentFixture<KeyGeneratorComponent>;
  let mockService: Partial<KeyGeneratorService>;
  let rawStateSignal: WritableSignal<KeyState | undefined>;
  let displayedSignal: WritableSignal<Partial<KeyState> | undefined>;
  let mockIssuanceService: Partial<CredentialIssuanceService>;

  beforeEach(async () => {
    rawStateSignal = signal(undefined);
    displayedSignal = signal({ desmosPrivateKeyValue: undefined });
    mockIssuanceService = {
      updateAlertMessages: jest.fn()
    };

    mockService = {
      getState: () => rawStateSignal,
      displayedKeys$: displayedSignal,
      generateP256: jest.fn().mockResolvedValue(undefined),
    };

    // Stub updateMessages on the prototype to avoid NG0950 "required Input"
    Object.defineProperty(
      KeyGeneratorComponent.prototype,
      'updateMessages',
      {
        configurable: true,
        writable: true,
        value: (_msgs: string[]) => {}
      }
    );

    await TestBed
      .configureTestingModule({
        imports: [KeyGeneratorComponent, TranslateModule.forRoot()]
      })
      .overrideComponent(KeyGeneratorComponent, {
        set: {
          providers: [
            { provide: KeyGeneratorService, useValue: mockService },
            { provide: CredentialIssuanceService, useValue: mockIssuanceService }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(KeyGeneratorComponent);
    component = fixture.componentInstance;
    jest.spyOn((component as any), 'updateAlertMessages');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('initially keyState$ and displayedKeys$ come from the service', () => {
    expect(component.keyState$()).toBeUndefined();
    expect(component.displayedKeys$()).toEqual({ desmosPrivateKeyValue: undefined });
  });

  it('ngOnInit should call updateAlertMessages', () => {
    const spy = jest
      .spyOn(component as any, 'updateAlertMessages')
      .mockImplementation(() => {});
    (component as any).ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('updateAlertMessages should delegate to issuance.updateAlertMessages service', () => {
    const msgs = ['error.form.no_key'];
    (component as any).updateAlertMessages(msgs);
    expect((mockIssuanceService.updateAlertMessages as jest.Mock)).toHaveBeenCalledWith(msgs);
  });

  it('generateKeys should call generateP256 and patch the form with the didKey', async () => {
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

    // Stub updateAlertMessages to avoid NG0950
    jest.spyOn(component as any, 'updateAlertMessages').mockImplementation(() => {});

    await component.generateKeys();

    expect(mockService.generateP256).toHaveBeenCalled();
    expect(fakeForm.patchValue).toHaveBeenCalledWith({ didKey: 'DID-123' });
  });

it('generateKeys should only update alert message if it is first time', async () => {
  component.ngOnInit();
  expect((component as any).updateAlertMessages).toHaveBeenCalledTimes(1);

  const fakeForm = { patchValue: jest.fn() } as unknown as FormGroup<any>;
  Object.defineProperty(component, 'form', { configurable: true, value: () => fakeForm });

  await component.generateKeys();

  expect((component as any).updateAlertMessages).toHaveBeenCalledTimes(2);
});

it('generateKeys should NOT update alert message if it is NOT the first time', async () => {
  component.ngOnInit();
  const fakeForm = { patchValue: jest.fn() } as unknown as FormGroup<any>;
  Object.defineProperty(component, 'form', { configurable: true, value: () => fakeForm });

  rawStateSignal.set({ desmosDidKeyValue: 'X', desmosPrivateKeyValue: 'Y' });

  await component.generateKeys();

  expect((component as any).updateAlertMessages).toHaveBeenCalledTimes(1);
});



  it('copyToClipboard should write to the clipboard and reset copiedKey after 2 seconds', fakeAsync(() => {
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

  it('resetCopiedKey should clear copiedKey', () => {
    component.copiedKey = 'xxx';
    (component as any).resetCopiedKey();
    expect(component.copiedKey).toBe('');
  });
});
