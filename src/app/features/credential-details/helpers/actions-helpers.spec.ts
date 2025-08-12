import { CredentialStatus, CredentialType, LifeCycleStatus } from 'src/app/core/models/entity/lear-credential';
import { credentialTypeHasSendReminderButton, credentialTypeHasSignCredentialButton, statusHasSendReminderlButton, statusHasSignCredentialButton } from './actions-helpers';

describe('Credential Helpers', () => {
  describe('credentialTypeHasSendReminderButton', () => {
    const allowed: CredentialType[] = ['LEARCredentialEmployee', 'gx:LabelCredential', 'LEARCredentialMachine'];
    const disallowed: any = 'SomeOtherType';

    it.each(allowed)('returns true for allowed type %s', (type) => {
      expect(credentialTypeHasSendReminderButton(type)).toBeTruthy()
    });

    it('returns false for a disallowed type', () => {
      expect(credentialTypeHasSendReminderButton(disallowed)).toBeFalsy();
    });
  });

  describe('credentialTypeHasSignCredentialButton', () => {
    const allowed: CredentialType[] = ['LEARCredentialEmployee', 'VerifiableCertification', 'gx:LabelCredential'];
    const disallowed: any = 'AnotherType';

    it.each(allowed)('returns true for allowed type %s', (type) => {
      expect(credentialTypeHasSignCredentialButton(type)).toBeTruthy();
    });

    it('returns false for a disallowed type', () => {
      expect(credentialTypeHasSignCredentialButton(disallowed)).toBeFalsy();
    });
  });

  describe('statusHasSendReminderlButton', () => {
    const allowed: LifeCycleStatus[] = ['WITHDRAWN', 'DRAFT', 'PEND_DOWNLOAD'];
    const disallowed: any = 'PUBLISHED';

    it.each(allowed)('returns true for allowed status %s', (status) => {
      expect(statusHasSendReminderlButton(status)).toBeTruthy();
    });

    it('returns false for a disallowed status', () => {
      expect(statusHasSendReminderlButton(disallowed)).toBeFalsy();
    });
  });

  describe('statusHasSignCredentialButton', () => {
    const allowed: LifeCycleStatus[] = ['PEND_SIGNATURE'];
    const disallowed: any = 'DRAFT';

    it.each(allowed)('returns true for allowed status %s', (status) => {
      expect(statusHasSignCredentialButton(status)).toBeTruthy();
    });

    it('returns false for a disallowed status', () => {
      expect(statusHasSignCredentialButton(disallowed)).toBeFalsy();
    });
  });
});
