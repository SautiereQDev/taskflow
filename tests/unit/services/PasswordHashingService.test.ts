/**
 * PasswordHashingService Unit Tests
 *
 * Tests password hashing and verification using bcrypt.
 * No mocking needed - bcrypt is the implementation being tested.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { PasswordHashingService } from '@application/services/PasswordHashingService.js';

describe('PasswordHashingService', () => {
  let service: PasswordHashingService;

  beforeEach(() => {
    service = new PasswordHashingService();
  });

  describe('hash()', () => {
    it('should hash a valid password', async () => {
      const plainPassword = 'SecurePassword123!';

      const hash = await service.hash(plainPassword);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plainPassword);
      expect(hash.length).toBeGreaterThan(50); // Bcrypt hashes are ~60 chars
      expect(hash).toMatch(/^\$2[aby]\$/); // Bcrypt format
    });

    it('should generate different hashes for same password', async () => {
      const plainPassword = 'SamePassword123!';

      const hash1 = await service.hash(plainPassword);
      const hash2 = await service.hash(plainPassword);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should throw error for empty password', async () => {
      await expect(service.hash('')).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for whitespace-only password', async () => {
      await expect(service.hash('   ')).rejects.toThrow('Password cannot be empty');
    });

    it('should hash passwords with special characters', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:",.<>?/~`';

      const hash = await service.hash(specialPassword);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should hash long passwords', async () => {
      const longPassword = 'A'.repeat(72); // Bcrypt max is 72 bytes

      const hash = await service.hash(longPassword);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should hash passwords with unicode characters', async () => {
      const unicodePassword = 'Пароль123!你好世界';

      const hash = await service.hash(unicodePassword);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('verify()', () => {
    it('should verify correct password', async () => {
      const plainPassword = 'CorrectPassword123!';
      const hash = await service.hash(plainPassword);

      const isValid = await service.verify(plainPassword, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const plainPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await service.hash(plainPassword);

      const isValid = await service.verify(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await service.hash('ValidPassword123!');

      const isValid = await service.verify('', hash);

      expect(isValid).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const isValid = await service.verify('ValidPassword123!', '');

      expect(isValid).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const isValid = await service.verify('ValidPassword123!', 'not-a-valid-bcrypt-hash');

      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const plainPassword = 'CaseSensitive123!';
      const hash = await service.hash(plainPassword);

      const isValidLower = await service.verify('casesensitive123!', hash);
      const isValidUpper = await service.verify('CASESENSITIVE123!', hash);

      expect(isValidLower).toBe(false);
      expect(isValidUpper).toBe(false);
    });

    it('should reject passwords with extra characters', async () => {
      const plainPassword = 'CorrectPassword123!';
      const hash = await service.hash(plainPassword);

      const isValid = await service.verify('CorrectPassword123!extra', hash);

      expect(isValid).toBe(false);
    });

    it('should reject passwords with missing characters', async () => {
      const plainPassword = 'CorrectPassword123!';
      const hash = await service.hash(plainPassword);

      const isValid = await service.verify('CorrectPassword123', hash);

      expect(isValid).toBe(false);
    });

    it('should verify passwords with special characters', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()';
      const hash = await service.hash(specialPassword);

      const isValid = await service.verify(specialPassword, hash);

      expect(isValid).toBe(true);
    });

    it('should verify passwords with unicode characters', async () => {
      const unicodePassword = 'Пароль123!你好';
      const hash = await service.hash(unicodePassword);

      const isValid = await service.verify(unicodePassword, hash);

      expect(isValid).toBe(true);
    });

    it('should handle null/undefined gracefully', async () => {
      const hash = await service.hash('ValidPassword123!');

      // @ts-expect-error Testing runtime behavior
      const isValidNull = await service.verify(null, hash);
      // @ts-expect-error Testing runtime behavior
      const isValidUndefined = await service.verify(undefined, hash);

      expect(isValidNull).toBe(false);
      expect(isValidUndefined).toBe(false);
    });
  });

  describe('hash() + verify() integration', () => {
    it('should work together for valid workflow', async () => {
      const passwords = [
        'SimplePass123',
        'Complex!P@ssw0rd#With$Symbols%',
        'Пароль12345',
        'A'.repeat(50),
      ];

      for (const password of passwords) {
        const hash = await service.hash(password);
        const isValid = await service.verify(password, hash);

        expect(isValid).toBe(true);
      }
    });

    it('should reject wrong passwords consistently', async () => {
      const correctPassword = 'CorrectPassword123!';
      const wrongPasswords = [
        'WrongPassword123!',
        'correctpassword123!', // Different case
        'CorrectPassword123', // Missing character
        'CorrectPassword123!extra', // Extra character
      ];

      const hash = await service.hash(correctPassword);

      for (const wrongPassword of wrongPasswords) {
        const isValid = await service.verify(wrongPassword, hash);
        expect(isValid).toBe(false);
      }
    });
  });

  describe('security properties', () => {
    it('should use sufficient salt rounds (deterministic hash check)', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hash(password);

      // Bcrypt hash format: $2a$<rounds>$<salt+hash>
      // Example: $2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
      const rounds = hash.split('$')[2];

      expect(rounds).toBe('12'); // 12 rounds as configured
    });

    it('should use bcrypt 2a/2b/2y algorithm', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hash(password);

      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should generate unique salts', async () => {
      const password = 'SamePassword123!';
      const hashes = await Promise.all([
        service.hash(password),
        service.hash(password),
        service.hash(password),
      ]);

      // All hashes should be different (unique salts)
      expect(new Set(hashes).size).toBe(3);
    });

    it(
      'should prevent timing attacks via constant-time comparison',
      async () => {
        const password = 'TestPassword123!';
        const hash = await service.hash(password);

        // Bcrypt.compare uses constant-time comparison
        // We test that verification time is similar for correct/incorrect passwords
        const iterations = 10;

        const correctTimings: number[] = [];
        const incorrectTimings: number[] = [];

        for (let i = 0; i < iterations; i++) {
          const start1 = Date.now();
          await service.verify(password, hash);
          const end1 = Date.now();
          correctTimings.push(end1 - start1);

          const start2 = Date.now();
          await service.verify('WrongPassword123!', hash);
          const end2 = Date.now();
          incorrectTimings.push(end2 - start2);
        }

        const avgCorrect = correctTimings.reduce((a, b) => a + b, 0) / iterations;
        const avgIncorrect = incorrectTimings.reduce((a, b) => a + b, 0) / iterations;

        // Timing should be similar (within 50% variance)
        // This is a rough check - bcrypt is designed for constant-time comparison
        const variance = Math.abs(avgCorrect - avgIncorrect) / Math.max(avgCorrect, avgIncorrect);
        expect(variance).toBeLessThan(0.5);
      },
      { timeout: 30000 } // Increase timeout to 30s for bcrypt operations
    );
  });
});
