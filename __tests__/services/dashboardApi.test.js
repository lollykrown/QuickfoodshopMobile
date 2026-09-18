import { changePwd, getProfile, updateProfile } from '@/services/dashboardApi';
import { fetchWithCred } from '@/lib/auth';

// dashboardApi only needs the axios instance from lib/auth; replace it with a callable mock.
jest.mock('@/lib/auth', () => {
  const instance = jest.fn();
  instance.get = jest.fn();
  instance.post = jest.fn();
  instance.patch = jest.fn();
  return { fetchWithCred: instance };
});

// Shapes axios uses for the three failure modes.
const serverError = (data, status = 400) => ({ response: { status, data }, message: 'Request failed' });
const noResponse = () => ({ request: {}, message: 'Network Error' });
const unexpected = () => new Error('kaboom');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('getProfile', () => {
  it('GETs /auth/profile and unwraps response.data.data', async () => {
    fetchWithCred.mockResolvedValue({ data: { data: { id: 1, email: 'a@b.co' } } });

    await expect(getProfile()).resolves.toEqual({ id: 1, email: 'a@b.co' });
    expect(fetchWithCred).toHaveBeenCalledWith('/auth/profile');
  });

  it('throws the backend message when the server rejects', async () => {
    fetchWithCred.mockRejectedValue(serverError({ message: 'Token invalid' }, 401));
    await expect(getProfile()).rejects.toThrow('Token invalid');
  });

  it('falls back to "Server error" when the backend gives no message', async () => {
    fetchWithCred.mockRejectedValue(serverError({}, 500));
    await expect(getProfile()).rejects.toThrow('Server error');
  });

  it('reports a network error when there was no response', async () => {
    fetchWithCred.mockRejectedValue(noResponse());
    await expect(getProfile()).rejects.toThrow('Network error');
  });

  it('reports an unexpected error otherwise', async () => {
    fetchWithCred.mockRejectedValue(unexpected());
    await expect(getProfile()).rejects.toThrow('Unexpected error');
  });
});

describe('updateProfile', () => {
  const payload = { firstName: 'Ada', lastName: 'Lovelace' };

  it('PATCHes the payload and returns the response body', async () => {
    fetchWithCred.patch.mockResolvedValue({ data: { data: { email: 'a@b.co' } } });

    await expect(updateProfile({ payload })).resolves.toEqual({ data: { email: 'a@b.co' } });
    expect(fetchWithCred.patch).toHaveBeenCalledWith('/auth/update-profile', payload);
  });

  it('throws the backend message when the server rejects', async () => {
    fetchWithCred.patch.mockRejectedValue(serverError({ message: 'Email already in use' }, 409));
    await expect(updateProfile({ payload })).rejects.toThrow('Email already in use');
  });

  it('falls back to "Server error" when the backend gives no message', async () => {
    fetchWithCred.patch.mockRejectedValue(serverError(undefined, 500));
    await expect(updateProfile({ payload })).rejects.toThrow('Server error');
  });

  it('reports a network error when there was no response', async () => {
    fetchWithCred.patch.mockRejectedValue(noResponse());
    await expect(updateProfile({ payload })).rejects.toThrow('Network error');
  });

  it('reports an unexpected error otherwise', async () => {
    fetchWithCred.patch.mockRejectedValue(unexpected());
    await expect(updateProfile({ payload })).rejects.toThrow('Unexpected error');
  });
});

describe('changePwd', () => {
  const payload = { currentPassword: 'old', newPassword: 'new', confirmPassword: 'new' };

  it.each([
    ['customer', '/auth/change-password'],
    ['vendor', '/vendor/auth/change-password'],
    ['rider', '/auth/rider/change-password'],
  ])('POSTs to the %s endpoint', async (role, path) => {
    fetchWithCred.post.mockResolvedValue({ data: {} });

    await expect(changePwd({ payload, role })).resolves.toEqual({ success: true });
    expect(fetchWithCred.post).toHaveBeenCalledWith(path, payload);
  });

  it('prefers the backend message on failure', async () => {
    fetchWithCred.post.mockRejectedValue(serverError({ message: 'Wrong password' }));
    await expect(changePwd({ payload, role: 'customer' })).rejects.toThrow('Wrong password');
  });

  it('falls back to the axios error message, then a generic one', async () => {
    fetchWithCred.post.mockRejectedValueOnce(serverError({}));
    await expect(changePwd({ payload, role: 'customer' })).rejects.toThrow('Request failed');

    fetchWithCred.post.mockRejectedValueOnce({ response: { data: {} } });
    await expect(changePwd({ payload, role: 'customer' })).rejects.toThrow('Unexpected error');
  });

  it('reports a network error when there was no response', async () => {
    fetchWithCred.post.mockRejectedValue(noResponse());
    await expect(changePwd({ payload, role: 'customer' })).rejects.toThrow('Network error');
  });

  it('reports an unexpected error otherwise', async () => {
    fetchWithCred.post.mockRejectedValue(unexpected());
    await expect(changePwd({ payload, role: 'customer' })).rejects.toThrow('Unexpected error');
  });
});
