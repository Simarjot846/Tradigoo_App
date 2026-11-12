/**
 * Validation Utilities Tests
 */

import {
  isValidEmail,
  isValidPhone,
  isValidGSTIN,
  isValidPincode,
  isStrongPassword,
  sanitizeInput,
} from '../validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.in')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Indian phone numbers', () => {
      expect(isValidPhone('9876543210')).toBe(true);
      expect(isValidPhone('8123456789')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(false); // doesn't start with 6-9
      expect(isValidPhone('98765')).toBe(false); // too short
    });
  });

  describe('isValidGSTIN', () => {
    it('should validate GSTIN format', () => {
      expect(isValidGSTIN('27AAPFU0939F1ZV')).toBe(true);
      expect(isValidGSTIN('invalid')).toBe(false);
      expect(isValidGSTIN('27AAPFU0939F1Z')).toBe(false); // too short
    });
  });

  describe('isValidPincode', () => {
    it('should validate Indian pincodes', () => {
      expect(isValidPincode('110001')).toBe(true);
      expect(isValidPincode('400001')).toBe(true);
      expect(isValidPincode('000001')).toBe(false); // starts with 0
      expect(isValidPincode('1234')).toBe(false); // too short
    });
  });

  describe('isStrongPassword', () => {
    it('should validate password strength', () => {
      expect(isStrongPassword('Password123')).toBe(true);
      expect(isStrongPassword('StrongP@ss1')).toBe(true);
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('noupppercase123')).toBe(false);
      expect(isStrongPassword('NOLOWERCASE123')).toBe(false);
      expect(isStrongPassword('NoNumbers')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitizeInput("It's a test")).toBe('It&#x27;s a test');
    });
  });
});
