import {
  editProfileSchema,
  loginSchema,
  pwdChngSchema,
  pwdResetSchema,
  signupSchema,
} from '@/lib/zod';

const messages = (result) => result.error.issues.map((i) => i.message);
const paths = (result) => result.error.issues.map((i) => i.path.join('.'));

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'secret1' }).success).toBe(true);
  });

  it('trims the email', () => {
    const result = loginSchema.safeParse({ email: '  a@b.co  ', password: 'secret1' });
    expect(result.success).toBe(true);
    expect(result.data.email).toBe('a@b.co');
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'nope', password: 'secret1' });
    expect(result.success).toBe(false);
    expect(messages(result)).toContain('Invalid email address');
  });

  it('rejects short passwords', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co', password: '12345' });
    expect(result.success).toBe(false);
    expect(messages(result)).toContain('Password must be at least 6 characters');
  });
});

describe('signupSchema', () => {
  const valid = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '+447123456789',
    password: 'secret1',
    confirmPassword: 'secret1',
  };

  it('accepts valid input', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ['firstName', { firstName: 'A' }, 'First name is required'],
    ['lastName', { lastName: 'L' }, 'Last name is required'],
    ['email', { email: 'bad' }, 'Invalid email address'],
    ['phone', { phone: '12345' }, 'Phone number is too short'],
    ['phone', { phone: '07123abc456' }, 'Invalid phone number'],
    ['password', { password: '123', confirmPassword: '123' }, 'Minimum 6 characters'],
  ])('rejects a bad %s', (field, override, message) => {
    const result = signupSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    expect(paths(result)).toContain(field);
    expect(messages(result)).toContain(message);
  });

  it('reports mismatched passwords on confirmPassword', () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: 'different1' });
    expect(result.success).toBe(false);
    expect(paths(result)).toEqual(['confirmPassword']);
    expect(messages(result)).toEqual(['Passwords do not match']);
  });
});

describe('editProfileSchema', () => {
  const valid = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phoneNumber: '07123456789',
  };

  it('uses the same field name as the edit-profile form (phoneNumber)', () => {
    expect(editProfileSchema.safeParse(valid).success).toBe(true);
  });

  it('does not accept the legacy `phone` field name in place of phoneNumber', () => {
    const { phoneNumber, ...rest } = valid;
    const result = editProfileSchema.safeParse({ ...rest, phone: phoneNumber });
    expect(result.success).toBe(false);
    expect(paths(result)).toContain('phoneNumber');
  });

  it('rejects a short or malformed phone number', () => {
    expect(editProfileSchema.safeParse({ ...valid, phoneNumber: '12' }).success).toBe(false);
    expect(editProfileSchema.safeParse({ ...valid, phoneNumber: 'abcdefghijk' }).success).toBe(
      false,
    );
  });

  it('rejects an invalid email', () => {
    expect(editProfileSchema.safeParse({ ...valid, email: 'x' }).success).toBe(false);
  });
});

describe('pwdResetSchema', () => {
  it('accepts matching passwords', () => {
    expect(
      pwdResetSchema.safeParse({ password: 'secret1', confirmPassword: 'secret1' }).success,
    ).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = pwdResetSchema.safeParse({ password: 'secret1', confirmPassword: 'secret2' });
    expect(result.success).toBe(false);
    expect(messages(result)).toContain('Passwords do not match');
  });

  it('rejects short passwords', () => {
    const result = pwdResetSchema.safeParse({ password: '123', confirmPassword: '123' });
    expect(result.success).toBe(false);
    expect(messages(result)).toContain('Minimum 6 characters');
  });
});

describe('pwdChngSchema', () => {
  const valid = { currentPassword: 'oldpass1', newPassword: 'newpass1', confirmPassword: 'newpass1' };

  it('accepts valid input', () => {
    expect(pwdChngSchema.safeParse(valid).success).toBe(true);
  });

  it('flags a too-short current password', () => {
    const result = pwdChngSchema.safeParse({ ...valid, currentPassword: '123' });
    expect(result.success).toBe(false);
    expect(messages(result)).toContain('Password is incorrect');
  });

  it('requires the new password to be confirmed', () => {
    const result = pwdChngSchema.safeParse({ ...valid, confirmPassword: 'other123' });
    expect(result.success).toBe(false);
    expect(paths(result)).toEqual(['confirmPassword']);
  });
});
