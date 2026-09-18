describe('constants/config', () => {
  const original = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

  afterEach(() => {
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
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    load();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('EXPO_PUBLIC_GOOGLE_API_KEY'));
    warn.mockRestore();
  });

  it('does not warn when the key is present', () => {
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY = 'abc123';
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    load();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
