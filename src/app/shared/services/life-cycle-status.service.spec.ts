import { LifeCycleStatusService } from './life-cycle-status.service';
import { CredentialProcedure } from 'src/app/core/models/dto/procedure-response.dto';
import { LifeCycleStatus } from 'src/app/core/models/entity/lear-credential';
import { STATUSES_WITH_DEFINED_CLASS } from 'src/app/core/models/entity/lear-credential-management';

describe('StatusService', () => {
  let service: LifeCycleStatusService;

  beforeEach(() => {
    service = new LifeCycleStatusService();
  });

  describe('mapStatusToClass', () => {
    it('should return "status-default" for statuses not in STATUSES_WITH_DEFINED_CLASS', () => {
      const result = service.mapStatusToClass('UNKNOWN' as LifeCycleStatus);
      expect(result).toBe('status-default');
    });

    it('should return the correct class for each defined status', () => {
      for (const status of STATUSES_WITH_DEFINED_CLASS) {
        const expected = `status-${status.toLowerCase().replace(/_/g, '-')}`;
        expect(service.mapStatusToClass(status)).toBe(expected);
      }
    });

    it('should convert underscores to hyphens for custom statuses when included', () => {
      (service as any).statusesWithDefinedClass = ['PEND_DOWNLOAD'];
      const result = service.mapStatusToClass('PEND_DOWNLOAD' as LifeCycleStatus);
      expect(result).toBe('status-pend-download');
    });
  });

  describe('addStatusClass', () => {
    it('should add statusClass to each CredentialProcedure preserving original data', () => {
      const procedures: CredentialProcedure[] = [
        {
          credential_procedure: {
            procedure_id: '1',
            subject: 'Alpha',
            credential_type: 'TypeA',
            status: 'VALID',
            updated: '2025-07-09T12:00:00Z',
          },
        },
        {
          credential_procedure: {
            procedure_id: '2',
            subject: 'Beta',
            credential_type: 'TypeB',
            status: 'UNKNOWN' as LifeCycleStatus,
            updated: '2025-07-09T13:00:00Z',
          },
        },
      ];

      const result = service.addStatusClass(procedures);

      expect(result).toHaveLength(2);

      expect(result[0].statusClass).toBe('status-valid');
      expect(result[0].credential_procedure).toEqual(procedures[0].credential_procedure);

      expect(result[1].statusClass).toBe('status-default');
      expect(result[1].credential_procedure).toEqual(procedures[1].credential_procedure);
    });

    it('should handle an empty array', () => {
      expect(service.addStatusClass([])).toEqual([]);
    });
  });
});

