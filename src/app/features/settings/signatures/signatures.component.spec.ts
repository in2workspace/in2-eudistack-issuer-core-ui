import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SignaturesComponent } from './signatures.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigurationService } from '../services/configuration.service';
import { SignatureConfigurationService } from '../services/signatureConfiguration.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import {
  SignatureConfigPayload,
  SignatureConfigurationRequest,
  SignatureConfigurationResponse,
  UpdateSignatureConfigurationRequest
} from '../models/signature.models';

describe('SignaturesComponent', () => {
  let component: SignaturesComponent;
  let fixture: ComponentFixture<SignaturesComponent>;

  // Mock route snapshot providing initial config and table entries
  const mockActivatedRoute = {
    snapshot: {
      data: {
        signatureData: {
          config: {
            enableRemoteSignature: true,
            signatureMode: 'CLOUD'
          } as SignatureConfigPayload,
          credentialList: [
            { id: 'cred1', cloudProviderName: 'AWS', credentialName: 'awsCred' }
          ]
        }
      }
    }
  };

  // Mock services
  const mockConfigurationService = {
    saveConfiguration: jest.fn().mockReturnValue(of(void 0)),
    updateConfiguration: jest.fn().mockReturnValue(of(void 0)),
  };

  const mockSignatureConfigService = {
    getAllConfiguration: jest.fn().mockReturnValue(of<SignatureConfigurationResponse[]>([
      {
        id: 'cred1',
        enableRemoteSignature: true,
        signatureMode: 'CLOUD',
        cloudProviderId: 'cp1',
        clientId: 'cli1',
        credentialId: 'cred1',
        credentialName: 'awsCred'
      }
    ])),
    addCredentialConfiguration: jest.fn().mockReturnValue(of({})),
    deleteSignatureConfiguration: jest.fn().mockReturnValue(of({})),
    updateConfiguration: jest.fn().mockReturnValue(of({})),
    getSignatureConfigById: jest.fn().mockReturnValue(of<SignatureConfigurationResponse>({
      id: 'cred1',
      enableRemoteSignature: true,
      signatureMode: 'CLOUD',
      cloudProviderId: 'cp1',
      clientId: 'cli1',
      credentialId: 'cred1',
      credentialName: 'awsCred'
    }))
  };

  const mockDialog = {
    openDialogWithForm: jest.fn().mockReturnValue({
      afterClosed: () => of(null)
    })
  };

  const mockLoader = {
    updateIsLoading: jest.fn()
  };

  const mockSignatureConfigurationResponse: SignatureConfigurationResponse = {
    id: 'cred1',
    enableRemoteSignature: true,
    signatureMode: 'CLOUD',
    cloudProviderId: 'cp1',
    clientId: 'cli1',
    credentialId: 'cred1',
    credentialName: 'awsCred'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SignaturesComponent, NoopAnimationsModule, TranslateModule.forRoot() ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ConfigurationService, useValue: mockConfigurationService },
        { provide: SignatureConfigurationService, useValue: mockSignatureConfigService },
        { provide: DialogWrapperService, useValue: mockDialog },
        { provide: LoaderService, useValue: mockLoader }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize config and table data from the route snapshot', () => {
    expect(component.signatureMode).toBe('CLOUD');
    expect(component.enableRemoteSignature).toBe(true);
    expect(component.initialConfig).toEqual({
      enableRemoteSignature: true,
      signatureMode: 'CLOUD'
    } as SignatureConfigPayload);

    expect(component.signatureConfigDataSource.data).toEqual([
      { id: 'cred1', cloudProviderName: 'AWS', credentialName: 'awsCred' }
    ]);
  });

  it('should detect changes when signatureMode or enableRemoteSignature differ from initial', () => {
    component.signatureMode = 'SERVER';
    expect(component.isConfigChanged).toBe(true);

    component.signatureMode = 'CLOUD';
    component.enableRemoteSignature = false;
    expect(component.isConfigChanged).toBe(true);
  });

  it('getChangedConfig should return empty object when there are no changes', () => {
    expect(component.getChangedConfig()).toEqual({});
  });

  it('buildCreatePayload should merge form values with current flags', () => {
    const formValue: Partial<SignatureConfigurationRequest> = {
      cloudProviderId: 'cpX',
      clientId: 'cliX',
      credentialId: 'credX',
      credentialName: 'nameX',
      clientSecret: 'secX',
      credentialPassword: 'passX'
    };
    const payload = (component as any).buildCreatePayload(formValue);
    expect(payload).toEqual({
      ...formValue,
      signatureMode: component.signatureMode,
      enableRemoteSignature: true
    });
  });

  it('buildUpdatePayload should include only changed fields and rationale', () => {
    const init: SignatureConfigurationResponse = {
      id: 'cred1',
      enableRemoteSignature: true,
      signatureMode: 'CLOUD',
      cloudProviderId: 'cp1',
      clientId: 'cli1',
      credentialId: 'cred1',
      credentialName: 'awsCred'
    };
    const formValue: UpdateSignatureConfigurationRequest = {
      enableRemoteSignature: true,
      signatureMode: 'CLOUD',
      cloudProviderId: 'cp2',
      clientId: 'cli1',
      credentialId: 'cred1',
      credentialName: 'awsCred',
      clientSecret: '',
      credentialPassword: '',
      secret: '',
      rationale: 'update reason'
    };
    const result = (component as any).buildUpdatePayload(formValue, init);
    expect(result).toEqual({
      cloudProviderId: 'cp2',
      rationale: 'update reason'
    });
  });

  it('getAsyncOperation should return correct handler for each mode', fakeAsync(() => {
    let response: any;

    const createOp = (component as any).getAsyncOperation('create');
    createOp({}).subscribe((r: any) => response = r);
    tick();
    expect(response).toBeDefined();

    const credential = {
      id: 'cred1',
      enableRemoteSignature: true,
      signatureMode: 'CLOUD',
      cloudProviderId: 'cp1',
      clientId: 'cli1',
      credentialId: 'cred1',
      credentialName: 'awsCred'
    } as SignatureConfigurationResponse;

    const editOp = (component as any).getAsyncOperation('edit', credential);
    editOp({ clientId: 'cli2' }).subscribe((r: any) => response = r);
    tick();
    expect(response).toBeDefined();

    const deleteOp = (component as any).getAsyncOperation('delete', credential);
    deleteOp({ rationale: 'remove' }).subscribe((r: any) => response = r);
    tick();
    expect(response).toBeDefined();
  }));

  it('addCredential should open dialog in create mode', () => {
    jest.spyOn<any, any>(component as any, 'openCredentialDialog');
    component.addCredential();
    expect((component as any).openCredentialDialog).toHaveBeenCalledWith('create', expect.any(String));
  });

  it('editCredential should retrieve credential and open dialog in edit mode', fakeAsync(() => {
    jest.spyOn<any, any>(component as any, 'openCredentialDialog');
    component.editCredential(mockSignatureConfigurationResponse);
    tick();
    expect(mockSignatureConfigService.getSignatureConfigById).toHaveBeenCalledWith('cred1');
    expect((component as any).openCredentialDialog)
      .toHaveBeenCalledWith('edit', expect.any(String), expect.objectContaining({ id: 'cred1' }));
  }));

  it('deleteCredential should open dialog in delete mode', () => {
    jest.spyOn<any, any>(component as any, 'openCredentialDialog');
    const cred = { id: 'cred1' } as SignatureConfigurationResponse;
    component.deleteSignatureConfiguration(cred);
    expect((component as any).openCredentialDialog).toHaveBeenCalledWith('delete', expect.any(String), cred);
  });

  it('reloadCredentialList should refresh data source and disable loader', fakeAsync(() => {
    component.reloadCredentialList();
    tick();
    expect(mockSignatureConfigService.getAllConfiguration).toHaveBeenCalledWith(component.signatureMode);
    expect(component.signatureConfigDataSource.data).toEqual([
      {
        id: 'cred1',
        enableRemoteSignature: true,
        signatureMode: 'CLOUD',
        cloudProviderId: 'cp1',
        clientId: 'cli1',
        credentialId: 'cred1',
        credentialName: 'awsCred'
      }
    ]);
    expect(mockLoader.updateIsLoading).toHaveBeenCalledWith(false);
  }));

  it('createConfiguration should call service and update initialConfig', fakeAsync(() => {
    component.initialConfig = null!;
    component.enableRemoteSignature = false;
    component.signatureMode = 'SERVER';
    component.createConfiguration();
    tick();
    expect(mockConfigurationService.saveConfiguration).toHaveBeenCalledWith(false, 'SERVER');
    expect(component.initialConfig).toEqual({
      enableRemoteSignature: false,
      signatureMode: 'SERVER'
    });
  }));

  it('updateConfiguration should call service only if there are changes', fakeAsync(() => {
    component.initialConfig = { enableRemoteSignature: true, signatureMode: 'CLOUD' };
    component.signatureMode = 'SERVER';
    component.updateConfiguration();
    tick();
    expect(mockConfigurationService.updateConfiguration).toHaveBeenCalledWith({ signatureMode: 'SERVER' });
    expect(component.initialConfig).toEqual({
      enableRemoteSignature: true,
      signatureMode: 'SERVER'
    });
  }));

  it('handleEdit should return noChanges when only rationale is provided', fakeAsync(() => {
    const cred = {
      id: 'cred1',
      enableRemoteSignature: true,
      signatureMode: 'CLOUD',
      cloudProviderId: 'cp1',
      clientId: 'cli1',
      credentialId: 'cred1',
      credentialName: 'awsCred'
    } as SignatureConfigurationResponse;

    let result: any;
    (component as any).handleEdit(
      { ...cred, rationale: 'because yes' },
      cred
    ).subscribe((r: any) => (result = r));
    tick();
    expect(result).toEqual({ noChanges: true });
  }));

  it('saveConfiguration should delegate to createConfiguration or updateConfiguration as appropriate', () => {
    component.initialConfig = null!;
    jest.spyOn(component, 'createConfiguration');
    component.saveConfiguration();
    expect(component.createConfiguration).toHaveBeenCalled();

    component.initialConfig = { enableRemoteSignature: true, signatureMode: 'CLOUD' };
    jest.spyOn(component, 'updateConfiguration');
    component.saveConfiguration();
    expect(component.updateConfiguration).toHaveBeenCalled();
  });
});
