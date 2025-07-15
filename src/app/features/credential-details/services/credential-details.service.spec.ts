import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CredentialDetailsService } from './credential-details.service';
import { FormBuilder } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { CredentialActionsService } from './credential-actions.service';
import { of } from 'rxjs';
import { DialogData } from 'src/app/shared/components/dialog/dialog.component';
import { Injector } from '@angular/core';
import { GxLabelCredentialDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/gx-label-credential-details-schema';
import { LearCredentialEmployeeDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-employee-details-schema';
import { LearCredentialMachineDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-machine-details-schema';
import { VerifiableCertificationDetailsTemplateSchema } from 'src/app/core/models/schemas/credential-details/verifiable-certification-details-schema';
import { DetailsKeyValueField, DetailsGroupField, TemplateSchema, MappedDetailsGroupField, MappedDetailsKeyValueField } from 'src/app/core/models/entity/lear-credential-details';
import { ComponentPortal } from '@angular/cdk/portal';

describe('CredentialDetailsService', () => {
  let service: CredentialDetailsService;

  const mockCredentialProcedureService = {
    getCredentialProcedureById: jest.fn(),
  };

  const mockCredentialActionsService = {
    openSendReminderDialog: jest.fn(),
    openSignCredentialDialog: jest.fn(),
    openRevokeCredentialDialog: jest.fn(),
  };

  const mockDialogWrapperService = {
    openErrorInfoDialog: jest.fn()
  } as any;
  const mockRouter = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        CredentialDetailsService,
        FormBuilder,
        { provide: CredentialProcedureService, useValue: mockCredentialProcedureService },
        { provide: CredentialActionsService, useValue: mockCredentialActionsService },
        { provide: DialogWrapperService, useValue: mockDialogWrapperService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(CredentialDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the procedureId$ signal when setProcedureId is called', () => {
    service.setProcedureId('abc123');
    expect(service.procedureId$()).toBe('abc123');
  });

  it('should call actionsService.openSendReminderDialog with procedureId', () => {
    service.procedureId$.set('pid123');
    service.openSendReminderDialog();
    expect(mockCredentialActionsService.openSendReminderDialog).toHaveBeenCalledWith('pid123');
  });

  it('should call actionsService.openSignCredentialDialog with procedureId', () => {
    service.procedureId$.set('pid456');
    service.openSignCredentialDialog();
    expect(mockCredentialActionsService.openSignCredentialDialog).toHaveBeenCalledWith('pid456');
  });

  it('should call actionsService.openRevokeCredentialDialog with credentialId and listId', () => {
    const mockCredential = {
      id: 'cred789',
      credentialStatus: { statusListCredential: ['list1', 'list2'] }
    } as any;
    const mockData = { lifeCycleStatus: 'VALID', credential: { vc: mockCredential } } as any;
    service.credentialDetailsData$.set(mockData);
    service.lifeCycleStatus$.set('VALID');
    service.credentialStatus$.set({prop:'value'}  as any);

    service.openRevokeCredentialDialog();
    expect(mockCredentialActionsService.openRevokeCredentialDialog)
      .toHaveBeenCalledWith('cred789', 'list2');
  });
  
  

  it('should execute credential action and perform navigation + reload', fakeAsync(() => {
    service.procedureId$.set('123');
  
    const actionMock = jest.fn().mockReturnValue(of(undefined));
  
    const dialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest.spyOn(mockDialogWrapperService, 'openDialog').mockReturnValue(dialogRef as any);
  
    const translateSpy = jest.spyOn(TestBed.inject(TranslateService), 'instant')
  .mockImplementation((key: string | string[]) =>
    typeof key === 'string' ? `Translated: ${key}` : key.join(', ')
  );

    const navigateSpy = jest.spyOn(mockRouter, 'navigate').mockResolvedValue(true);
    const reloadSpy = jest.spyOn(window.location, 'reload');
  
    const result = (service as any).executeCredentialAction(
      actionMock,
      'some.title.key',
      'some.message.key'
    );
  
    tick();
  
    result.subscribe({
      complete: () => {
        expect(actionMock).toHaveBeenCalledWith('123');
  
        expect(mockDialogWrapperService.openDialog).toHaveBeenCalledWith({
          title: 'Translated: some.title.key',
          message: 'Translated: some.message.key',
          confirmationType: 'none',
          status: 'default',
        });
  
        expect(navigateSpy).toHaveBeenCalledWith(['/organization/credentials']);
        expect(reloadSpy).toHaveBeenCalled();
      },
    });
  
    tick();
  }));
  
  
  
  // it('should sign credential, open success dialog, navigate, and reload page', fakeAsync(() => {
  //   service.procedureId$.set('456');
  
  //   const signCredentialMock = jest
  //     .spyOn(mockCredentialProcedureService, 'signCredential')
  //     .mockReturnValue(of(undefined));
  
  //   const dialogRefMock = {
  //     afterClosed: jest.fn().mockReturnValue(of(true)),
  //   };
  //   jest.spyOn(mockDialogWrapperService, 'openDialog').mockReturnValue(dialogRefMock as any);
  
  //   const routerNavigateSpy = jest.spyOn(mockRouter, 'navigate').mockResolvedValue(true);
  //   const locationReloadSpy = jest.spyOn(globalThis.location, 'reload').mockImplementation(() => {});
  
  //   service.signCredential().subscribe();
  
  //   tick();
  
  //   expect(signCredentialMock).toHaveBeenCalledWith('456');
  
  //   const expectedDialogData: DialogData = {
  //     title: TestBed.inject(TranslateService).instant("credentialDetails.signCredentialSuccess.title"),
  //     message: TestBed.inject(TranslateService).instant("credentialDetails.signCredentialSuccess.message"),
  //     confirmationType: 'none',
  //     status: 'default',
  //   };
  
  //   expect(mockDialogWrapperService.openDialog).toHaveBeenCalledWith(expectedDialogData);
  //   expect(routerNavigateSpy).toHaveBeenCalledWith(['/organization/credentials']);
  //   expect(locationReloadSpy).toHaveBeenCalled();
  // }));

  describe('mapFieldMain', () => {
 it('should map “key-value” and “group” correctly', () => {
    const credStub = { foo: 'bar' } as any;

    const kv: DetailsKeyValueField = {
      type: 'key-value',
      key: 'x',
      value: (c: any) => 'valX',
      custom: {
        token: 'T' as any,
        component: class {},
        value: (c: any) => 'V'
      }
    };

    const grp: DetailsGroupField = {
      type: 'group',
      key: 'g',
      value: (c: any) => [
        { type: 'key-value', key: 'y', value: 'valY' }
      ] as DetailsKeyValueField[]
    };

    const kvGroup: DetailsGroupField = {
      type: 'group',
      key: 'gKv',
      value: [ kv ]
    };

    const schema: TemplateSchema = {
      main: [ kvGroup, grp ],
      side: []
    };

    const mapped = (service as any).mapSchemaValues(schema, credStub);

    const mappedGroup = mapped.main[0] as any;
    expect(mappedGroup.key).toBe('gKv');
    expect(Array.isArray(mappedGroup.value)).toBeTruthy();

    const mappedKv = mappedGroup.value[0] as any;
    expect(mappedKv.key).toBe('x');
    expect(mappedKv.value).toBe('valX');
    expect(mappedKv.custom!.value).toBe('V');

    const mappedDynGroup = mapped.main[1] as any;
    expect(mappedDynGroup.key).toBe('g');
    expect(Array.isArray(mappedDynGroup.value)).toBeTruthy();
    expect((mappedDynGroup.value[0] as any).value).toBe('valY');
  });
});

  describe('getSchemaByType', () => {
    it('retorna el schema correcte per cada tipus', () => {
      expect((service as any).getSchemaByType('LEARCredentialEmployee'))
        .toBe(LearCredentialEmployeeDetailsTemplateSchema);
      expect((service as any).getSchemaByType('LEARCredentialMachine'))
        .toBe(LearCredentialMachineDetailsTemplateSchema);
      expect((service as any).getSchemaByType('VerifiableCertification'))
        .toBe(VerifiableCertificationDetailsTemplateSchema);
      expect((service as any).getSchemaByType('gx:LabelCredential'))
        .toBe(GxLabelCredentialDetailsTemplateSchema);
    });
  });

describe('Load models', () => {
  it('should load and map credential models correctly', () => {
  const svc: any = service;

  jest.spyOn(svc, 'credentialType$').mockReturnValue('MyType');

  const vc = { foo: 'bar' };
  const mockData = { credential: { vc, type: 'MyType' } };
  jest.spyOn(svc, 'loadCredentialDetails').mockReturnValue(of(mockData));

  const basicInfoSpy = jest.spyOn(svc, 'setCredentialBasicInfo').mockImplementation(() => {});
  const getSchemaSpy   = jest.spyOn(svc, 'getSchemaByType').mockReturnValue({ schemaKey: 'schemaVal' });
  const mapped         = { mappedKey: 'mappedVal' };
  const mapSpy         = jest.spyOn(svc, 'mapSchemaValues').mockReturnValue(mapped);
  const templateSpy    = jest.spyOn(svc, 'setTemplateModels').mockImplementation(() => {});

  const injector = TestBed.inject(Injector);
  svc.loadCredentialModels(injector);

  expect(svc.loadCredentialDetails).toHaveBeenCalled();
  expect(basicInfoSpy).toHaveBeenCalledWith(mockData);
  expect(getSchemaSpy).toHaveBeenCalledWith('MyType');
  expect(mapSpy).toHaveBeenCalledWith({ schemaKey: 'schemaVal' }, vc);
  expect(templateSpy).toHaveBeenCalledWith(mapped, injector);
});
});

describe('getCredentialType', () => {
  beforeEach(() => {
    // Override private schema map to include our test type
    (service as any).schemasByTypeMap = { 'LearCredentialEmployee': {} };
  });

  it('should return the correct type when present in schemasByTypeMap', () => {
    // Arrange a credential with a valid type
    const cred: any = { type: ['LearCredentialEmployee', 'Foo'] };
    // Act
    const type = (service as any).getCredentialType(cred);
    // Assert
    expect(type).toBe('LearCredentialEmployee');
  });

  it('should throw an error when no valid type is found', () => {
    // Arrange schemas map with a different type
    (service as any).schemasByTypeMap = { 'SomeOtherType': {} };
    const cred: any = { type: ['UnknownType', 'Foo'] };
    // Act & Assert
    expect(() => (service as any).getCredentialType(cred))
      .toThrowError('No credential tyep found in credential');
  });
});

describe('shouldIncludeSideField', () => {
  it('should include fields with a key other than "issuer"', () => {
    const field: any = { key: 'other', type: 'key-value', value: null };
    expect((service as any).shouldIncludeSideField(field)).toBe(true);
  });

  it('should exclude issuer when type is key-value and value is null', () => {
    const field: any = { key: 'issuer', type: 'key-value', value: null };
    expect((service as any).shouldIncludeSideField(field)).toBe(false);
  });

  it('should include issuer when type is key-value and value is not null', () => {
    const field: any = { key: 'issuer', type: 'key-value', value: 'foo' };
    expect((service as any).shouldIncludeSideField(field)).toBe(true);
  });

  it('should exclude issuer when type is group and all children values are null', () => {
    const field: any = {
      key: 'issuer',
      type: 'group',
      value: [
        { type: 'key-value', value: null },
        { type: 'key-value', value: null },
      ],
    };
    expect((service as any).shouldIncludeSideField(field)).toBe(false);
  });

  it('should include issuer when type is group and at least one child value is not null', () => {
    const field: any = {
      key: 'issuer',
      type: 'group',
      value: [
        { type: 'key-value', value: null },
        { type: 'key-value', value: 'bar' },
      ],
    };
    expect((service as any).shouldIncludeSideField(field)).toBe(true);
  });
});

describe('setCredentialBasicInfo', () => {
  let mockValidFrom$: { set: jest.Mock<any, any> };
  let mockValidUntil$: { set: jest.Mock<any, any> };
  let mockType$: { set: jest.Mock<any, any> };
  let mockStatus$: { set: jest.Mock<any, any> };

  beforeEach(() => {
    // Mock the internal subjects with typed Jest mocks
    mockValidFrom$ = { set: jest.fn() };
    mockValidUntil$ = { set: jest.fn() };
    mockType$ = { set: jest.fn() };
    mockStatus$ = { set: jest.fn() };

    (service as any).credentialValidFrom$ = mockValidFrom$;
    (service as any).credentialValidUntil$ = mockValidUntil$;
    (service as any).credentialType$ = mockType$;
    (service as any).credentialStatus$ = mockStatus$;

    // Spy on the private getCredentialType to return a fixed type
    jest.spyOn(service as any, 'getCredentialType').mockReturnValue('TypeA');
  });

  it('should set validFrom, validUntil, type and status correctly', () => {
    // Arrange
    const details: any = {
      credential: {
        vc: {
          validFrom: '2020-01-01',
          validUntil: '2021-01-01',
          type: ['foo']
        }
      },
      credential_status: 'active'
    };

    // Act
    (service as any).setCredentialBasicInfo(details);

    // Assert
    expect(mockValidFrom$.set).toHaveBeenCalledWith('2020-01-01');
    expect(mockValidUntil$.set).toHaveBeenCalledWith('2021-01-01');
    expect((service as any).getCredentialType).toHaveBeenCalledWith(details.credential.vc);
    expect(mockType$.set).toHaveBeenCalledWith('TypeA');
    expect(mockStatus$.set).toHaveBeenCalledWith('active');
  });
});

describe('setTemplateModels', () => {
  let mockMainTemplateModel$: { set: jest.Mock<any, any> };
  let mockSideTemplateModel$: { set: jest.Mock<any, any> };

  beforeEach(() => {
    // Mock the internal template model subjects
    mockMainTemplateModel$ = { set: jest.fn() };
    mockSideTemplateModel$ = { set: jest.fn() };
    (service as any).mainTemplateModel$ = mockMainTemplateModel$;
    (service as any).sideTemplateModel$ = mockSideTemplateModel$;
  });

  it('should extend main and side schemas and set the template models', () => {
    // Arrange dummy schema and injector
    const dummySchema: any = { main: { foo: 'bar' }, side: { baz: 'qux' } };
    const dummyInjector = {} as Injector;

    // Prepare extended schemas
    const extendedMain = { foo: 'extended' };
    const extendedSide = { baz: 'extended' };
    // Spy on extendFields to return extended schemas in order
    const extendSpy = jest.spyOn(service as any, 'extendFields')
      .mockReturnValueOnce(extendedMain)
      .mockReturnValueOnce(extendedSide);

    // Act: call the private method
    (service as any).setTemplateModels(dummySchema, dummyInjector);

    // Assert extendFields calls
    expect(extendSpy).toHaveBeenCalledWith(dummySchema.main, dummyInjector);
    expect(extendSpy).toHaveBeenCalledWith(dummySchema.side, dummyInjector);

    // Assert that template models are set
    expect(mockMainTemplateModel$.set).toHaveBeenCalledWith(extendedMain);
    expect(mockSideTemplateModel$.set).toHaveBeenCalledWith(extendedSide);
  });
});

describe('extendFields', () => {
  it('should return identical fields array when no custom or group', () => {
    // Arrange
    const fields: any[] = [
      { key: 'field1', type: 'key-value', value: 'val', custom: null }
    ];
    const injector = Injector.create({ providers: [] });

    // Act
    const result = (service as any).extendFields(fields, injector);

    // Assert
    expect(result).toEqual(fields);
    expect(result[0].portal).toBeUndefined();
  });

  it('should add portal property when custom is defined', () => {
    // Arrange dummy component and token/value
    class DummyComponent {};
    const token = 'TEST_TOKEN';
    const tokenInjectionValue = 'injectedValue';

    const fields: any[] = [
      {
        key: 'field2',
        type: 'custom',
        value: 'val2',
        custom: {
          token,
          value: tokenInjectionValue,
          component: DummyComponent
        }
      }
    ];
    const injector = Injector.create({ providers: [] });

    // Act
    const result = (service as any).extendFields(fields, injector);
    const extended = result[0];

    // Assert portal instance and injector behavior
    expect(extended.portal).toBeInstanceOf(ComponentPortal);
    expect((extended.portal as ComponentPortal<any>).component).toBe(DummyComponent);
    // The portal.injector should provide the custom value
    expect(extended.portal.injector.get(token)).toBe(tokenInjectionValue);
  });

  it('should recursively extend group fields', () => {
    // Arrange a nested group field
    const nested: any = {
      key: 'nested',
      type: 'key-value',
      value: 'nestedVal',
      custom: null
    };
    const groupField: any = {
      key: 'groupField',
      type: 'group',
      value: [nested],
      custom: null
    };
    const injector = Injector.create({ providers: [] });

    // Spy on extendFields to track recursive calls
    const spy = jest.spyOn(service as any, 'extendFields');

    // Act
    const result = (service as any).extendFields([groupField], injector);
    const extendedGroup = result[0];

    // Assert top-level call and recursive call
    expect(spy).toHaveBeenCalledWith([nested], injector);
    expect(extendedGroup.value).toEqual([nested]);
  });
});

});
