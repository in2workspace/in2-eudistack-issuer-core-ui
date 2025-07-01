import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { KeyGeneratorComponent } from './key-generator.component';
import { KeyGeneratorService, KeyState } from '../../services/key-generator.service';
import { signal, WritableSignal, Signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

describe('KeyGeneratorComponent', () => {
  let component: KeyGeneratorComponent;
  let fixture: ComponentFixture<KeyGeneratorComponent>;
  let mockService: Partial<KeyGeneratorService>;
  let rawStateSignal: WritableSignal<KeyState | undefined>;
  let readonlyStateSignal: Signal<KeyState | undefined>;
  let displayedSignal: WritableSignal<Partial<KeyState> | undefined>;

  beforeEach(async () => {
  rawStateSignal = signal(undefined);
  readonlyStateSignal = rawStateSignal.asReadonly();
  displayedSignal = signal({ desmosPrivateKeyValue: undefined });

  mockService = {
    getState: () => rawStateSignal,
    displayedKeys$: displayedSignal,
    generateP256: jest.fn().mockResolvedValue(undefined),
  };

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit updateKeys on state change', () => {
    const spy = jest.spyOn(component.updateKeys, 'emit');

    // Update state via raw signal
    (component.keyState$ as WritableSignal<any>).set({ desmosPrivateKeyValue: 'abc', desmosDidKeyValue: 'did:xyz' });
    fixture.detectChanges();
    TestBed.flushEffects();

    // Effect should emit new state
    expect(spy).toHaveBeenCalledWith({ desmosPrivateKeyValue: 'abc', desmosDidKeyValue: 'did:xyz' });
  });

   it('generateKeys should call service.generateP256', async () => {
    await component.generateKeys();
    expect(mockService.generateP256).toHaveBeenCalled();
  });

  it('copyToClipboard should write text and reset copiedKey after timeout', fakeAsync(() => {

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

    writeSpy.mockRestore();
  }));

  it('should reset keys', () => {
    component.copiedKey = "aabb";
    component.resetCopiedKey();
    expect(component.copiedKey).toBe("");
  });
});
