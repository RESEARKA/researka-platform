import { 
  verifyEmailDomain, 
  requiresDomainVerification, 
  getExpectedDomain,
  UNIVERSITY_DOMAINS
} from '../universityDomains';
import { expect } from '@jest/globals';

describe('University Domain Verification', () => {
  describe('requiresDomainVerification', () => {
    it('should return true for universities in the list', () => {
      expect(requiresDomainVerification('Harvard University')).toBe(true);
      expect(requiresDomainVerification('Stanford University')).toBe(true);
      expect(requiresDomainVerification('Massachusetts Institute of Technology')).toBe(true);
    });

    it('should return false for universities not in the list', () => {
      expect(requiresDomainVerification('Random University')).toBe(false);
      expect(requiresDomainVerification('Other (not listed)')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(requiresDomainVerification('HARVARD UNIVERSITY')).toBe(true);
      expect(requiresDomainVerification('harvard university')).toBe(true);
    });
  });

  describe('getExpectedDomain', () => {
    it('should return the correct domain for universities in the list', () => {
      expect(getExpectedDomain('Harvard University')).toBe('harvard.edu');
      expect(getExpectedDomain('Stanford University')).toBe('stanford.edu');
      expect(getExpectedDomain('Massachusetts Institute of Technology')).toBe('mit.edu');
    });

    it('should return null for universities not in the list', () => {
      expect(getExpectedDomain('Random University')).toBeNull();
      expect(getExpectedDomain('Other (not listed)')).toBeNull();
    });

    it('should be case insensitive', () => {
      expect(getExpectedDomain('HARVARD UNIVERSITY')).toBe('harvard.edu');
      expect(getExpectedDomain('harvard university')).toBe('harvard.edu');
    });
  });

  describe('verifyEmailDomain', () => {
    it('should return true for emails with matching domains', () => {
      expect(verifyEmailDomain('user@harvard.edu', 'Harvard University')).toBe(true);
      expect(verifyEmailDomain('user@stanford.edu', 'Stanford University')).toBe(true);
      expect(verifyEmailDomain('user@mit.edu', 'Massachusetts Institute of Technology')).toBe(true);
    });

    it('should return false for emails with non-matching domains', () => {
      expect(verifyEmailDomain('user@gmail.com', 'Harvard University')).toBe(false);
      expect(verifyEmailDomain('user@yahoo.com', 'Stanford University')).toBe(false);
      expect(verifyEmailDomain('user@outlook.com', 'Massachusetts Institute of Technology')).toBe(false);
    });

    it('should return true for universities not requiring verification', () => {
      expect(verifyEmailDomain('user@gmail.com', 'Random University')).toBe(true);
      expect(verifyEmailDomain('user@yahoo.com', 'Other (not listed)')).toBe(true);
    });

    it('should handle invalid email formats', () => {
      expect(verifyEmailDomain('invalid-email', 'Harvard University')).toBe(false);
      expect(verifyEmailDomain('user@', 'Harvard University')).toBe(false);
      expect(verifyEmailDomain('@harvard.edu', 'Harvard University')).toBe(false);
    });

    it('should be case insensitive for both email domains and university names', () => {
      expect(verifyEmailDomain('user@HARVARD.EDU', 'Harvard University')).toBe(true);
      expect(verifyEmailDomain('user@harvard.edu', 'HARVARD UNIVERSITY')).toBe(true);
    });
  });

  describe('UNIVERSITY_DOMAINS data integrity', () => {
    it('should have unique university names', () => {
      const names = UNIVERSITY_DOMAINS.map(uni => uni.name.toLowerCase());
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });

    it('should have valid domain formats', () => {
      const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
      UNIVERSITY_DOMAINS.forEach(uni => {
        expect(domainRegex.test(uni.domain)).toBe(true);
      });
    });
  });
});
