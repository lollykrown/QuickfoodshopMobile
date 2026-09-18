describe('constants/config', () => {
  const original = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  let warn;

  // The module warns (in dev) when the key is missing, which several tests below trigger on purpose.
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
    if (original === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
    else process.env.EXPO_PUBLIC_GOOGLE_API_KEY = original;
    jest.resetModules();
  });

  const load = () => {
    jest.resetModules();
    return require('@/constants/config');
  };

  it('reads the Google API key from EXPO_PUBLIC_GOOGLE_API_KEY', () => {
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY = 'abc123';
    expect(load().GOOGLE_API_KEY).toBe('abc123');
  });

  it('is an empty string (not undefined) when the key is not configured', () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
    expect(load().GOOGLE_API_KEY).toBe('');
  });

  it('warns in development when the key is missing', () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

    load();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('EXPO_PUBLIC_GOOGLE_API_KEY'));
  });

  it('does not warn when the key is present', () => {
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY = 'abc123';

    load();

    expect(warn).not.toHaveBeenCalled();
  });
});
