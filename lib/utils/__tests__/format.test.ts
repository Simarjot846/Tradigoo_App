/**
 * Format Utilities Tests
 */

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatPercentage,
} from '../format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency in INR', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
      expect(formatCurrency(50000)).toBe('₹50,000');
      expect(formatCurrency(1234567)).toBe('₹12,34,567');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('12,34,567');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages', () => {
      expect(formatPercentage(15.5)).toBe('15.5%');
      expect(formatPercentage(100, 0)).toBe('100%');
      expect(formatPercentage(33.333, 2)).toBe('33.33%');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30000);
      const twoMinutesAgo = new Date(now.getTime() - 120000);
      
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('30s ago');
      expect(formatRelativeTime(twoMinutesAgo)).toBe('2m ago');
    });
  });
});
