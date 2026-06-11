import { describe, expect, it } from 'vitest';
import { MOCK_USERS } from './mock-users';

describe('MOCK_USERS', () => {
  it('contains exactly two admins and two standard users', () => {
    expect(MOCK_USERS).toHaveLength(4);
    expect(MOCK_USERS.filter(({ role }) => role === 'admin')).toHaveLength(2);
    expect(MOCK_USERS.filter(({ role }) => role === 'user')).toHaveLength(2);
  });

  it('stores every password as a SHA-256 hash', () => {
    expect(MOCK_USERS.every(({ passwordHash }) => /^[a-f0-9]{64}$/.test(passwordHash))).toBe(true);
  });
});
