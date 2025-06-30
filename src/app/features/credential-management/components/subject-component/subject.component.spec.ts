import { TestBed } from '@angular/core/testing';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CredentialProcedureType } from 'src/app/core/models/dto/procedure-response.dto';
import { SubjectComponent } from './subject-component.component';

describe('SubjectUuidComponent Logic', () => {
  let component: SubjectComponent;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = TestBed.inject(EnvironmentInjector);
    runInInjectionContext(injector, () => {
      component = new SubjectComponent();
    });
  });

  describe('handleSubject', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const subjectWithUuid = `prefix-${uuid}`;
    const plainSubject = 'no-uuid-here';

    it('should extract UUID when type is LABEL_CREDENTIAL and UUID is present', () => {
      const result = runInInjectionContext(injector, () => 
        component['handleSubject'](subjectWithUuid, 'LABEL_CREDENTIAL' as CredentialProcedureType)
      );
      expect(result).toBe(uuid);
    });

    it('should return full subject when type is LABEL_CREDENTIAL but no UUID present', () => {
      const result = runInInjectionContext(injector, () => 
        component['handleSubject'](plainSubject, 'LABEL_CREDENTIAL' as CredentialProcedureType)
      );
      expect(result).toBe(plainSubject);
    });

    it('should return full subject for types not in SUBJECT_HANDLERS_MAP', () => {
      const result = runInInjectionContext(injector, () => 
        component['handleSubject'](subjectWithUuid, 'OTHER_CREDENTIAL' as CredentialProcedureType)
      );
      expect(result).toBe(subjectWithUuid);
    });
  });

  describe('extractUuid', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';

    it('should extract a valid UUID at the end of the string', () => {
      const result = runInInjectionContext(injector, () => 
        component['extractUuid'](`prefix-${uuid}`)
      );
      expect(result).toBe(uuid);
    });

    it('should return the original string if no UUID match is found', () => {
      const result = runInInjectionContext(injector, () => 
        component['extractUuid']('no-uuid-present')
      );
      expect(result).toBe('no-uuid-present');
    });
  });

  describe('displayValue$', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const subjectWithUuid = `prefix-${uuid}`;
    const plainSubject = 'no-uuid-here';

    it('should return extracted UUID when type is LABEL_CREDENTIAL and UUID present', () => {
      runInInjectionContext(injector, () => {
        (component as any)['subject$'] = () => subjectWithUuid;
        (component as any)['type$'] = () => 'LABEL_CREDENTIAL' as CredentialProcedureType;
      });
      const result = runInInjectionContext(injector, () => component.displayValue$());
      expect(result).toBe(uuid);
    });

    it('should return full subject when type is LABEL_CREDENTIAL but no UUID present', () => {
      runInInjectionContext(injector, () => {
        (component as any)['subject$'] = () => plainSubject;
        (component as any)['type$'] = () => 'LABEL_CREDENTIAL' as CredentialProcedureType;
      });
      const result = runInInjectionContext(injector, () => component.displayValue$());
      expect(result).toBe(plainSubject);
    });

    it('should return full subject when type is not LABEL_CREDENTIAL', () => {
      runInInjectionContext(injector, () => {
        (component as any)['subject$'] = () => subjectWithUuid;
        (component as any)['type$'] = () => 'OTHER_CREDENTIAL' as CredentialProcedureType;
      });
      const result = runInInjectionContext(injector, () => component.displayValue$());
      expect(result).toBe(subjectWithUuid);
    });
  });
});
