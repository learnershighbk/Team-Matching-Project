/**
 * 해시 유틸리티 테스트
 */

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/hash';

describe('해시 유틸리티', () => {
  describe('hashPassword', () => {
    it('비밀번호를 해싱함', async () => {
      const password = '1234';

      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
    });

    it('해시값은 bcrypt 형식임', async () => {
      const password = 'testpassword';

      const hash = await hashPassword(password);

      // bcrypt 해시는 $2a$ 또는 $2b$로 시작
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('동일한 비밀번호도 다른 해시값 생성 (salt 적용)', async () => {
      const password = 'samepassword';

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('빈 문자열도 해싱 가능', async () => {
      const password = '';

      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('4자리 PIN 해싱', async () => {
      const pin = '1234';

      const hash = await hashPassword(pin);

      expect(hash).toBeDefined();
      const isValid = await verifyPassword(pin, hash);
      expect(isValid).toBe(true);
    });

    it('긴 비밀번호 해싱', async () => {
      const longPassword = 'a'.repeat(100);

      const hash = await hashPassword(longPassword);

      expect(hash).toBeDefined();
      const isValid = await verifyPassword(longPassword, hash);
      expect(isValid).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('일치하는 비밀번호 검증 성공', async () => {
      const password = 'correctpassword';
      const hash = await hashPassword(password);

      const result = await verifyPassword(password, hash);

      expect(result).toBe(true);
    });

    it('불일치하는 비밀번호 검증 실패', async () => {
      const password = 'correctpassword';
      const hash = await hashPassword(password);

      const result = await verifyPassword('wrongpassword', hash);

      expect(result).toBe(false);
    });

    it('4자리 PIN 검증 성공', async () => {
      const pin = '1234';
      const hash = await hashPassword(pin);

      const result = await verifyPassword(pin, hash);

      expect(result).toBe(true);
    });

    it('잘못된 PIN 검증 실패', async () => {
      const correctPin = '1234';
      const wrongPin = '5678';
      const hash = await hashPassword(correctPin);

      const result = await verifyPassword(wrongPin, hash);

      expect(result).toBe(false);
    });

    it('대소문자 구분', async () => {
      const password = 'Password';
      const hash = await hashPassword(password);

      const lowercase = await verifyPassword('password', hash);
      const uppercase = await verifyPassword('PASSWORD', hash);

      expect(lowercase).toBe(false);
      expect(uppercase).toBe(false);
    });

    it('공백 문자 구분', async () => {
      const password = 'test password';
      const hash = await hashPassword(password);

      const noSpace = await verifyPassword('testpassword', hash);
      const withSpace = await verifyPassword('test password', hash);

      expect(noSpace).toBe(false);
      expect(withSpace).toBe(true);
    });

    it('숫자 PIN 문자열로 검증', async () => {
      const pin = '0000';
      const hash = await hashPassword(pin);

      const result = await verifyPassword('0000', hash);

      expect(result).toBe(true);
    });
  });
});

describe('PIN 유효성 시나리오', () => {
  it('4자리 숫자 PIN 해싱 및 검증', async () => {
    const pins = ['0000', '1234', '9999', '0001'];

    for (const pin of pins) {
      const hash = await hashPassword(pin);
      const isValid = await verifyPassword(pin, hash);
      expect(isValid).toBe(true);
    }
  });

  it('잘못된 PIN 시도 모두 실패', async () => {
    const correctPin = '1234';
    const hash = await hashPassword(correctPin);
    const wrongPins = ['0000', '1111', '4321', '12345', '123'];

    for (const wrongPin of wrongPins) {
      const isValid = await verifyPassword(wrongPin, hash);
      expect(isValid).toBe(false);
    }
  });
});
