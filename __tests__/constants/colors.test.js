import fs from 'fs';
import path from 'path';
import { Colors, Fonts } from '@/constants/colors';

const ROOT = path.join(__dirname, '..', '..');
const SOURCE_DIRS = ['app', 'components', 'contexts', 'hooks'];

const sourceFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(js|jsx)$/.test(entry.name) ? [full] : [];
  });

describe('Colors', () => {
  it('defines the brand palette', () => {
    expect(Colors.primary).toBe('#006634');
    expect(Colors).toMatchObject({
      red: expect.any(String),
      yellow: expect.any(String),
      orange: expect.any(String),
      green: expect.any(String),
      grey: expect.any(String),
      lightGrey: expect.any(String),
      border: expect.any(String),
    });
  });

  it('has matching light and dark theme tokens', () => {
    expect(Object.keys(Colors.dark).sort()).toEqual(Object.keys(Colors.light).sort());
  });

  it('uses valid colour values', () => {
    const flat = [
      ...Object.values(Colors).filter((v) => typeof v === 'string'),
      ...Object.values(Colors.light),
      ...Object.values(Colors.dark),
    ];
    flat.forEach((value) => expect(value).toMatch(/^(#[0-9a-fA-F]{3,8}|rgba?\([\d\s.,]+\))$/));
  });

  // A typo like Colors.lightGrey (once missing) silently renders as "no colour".
  it('defines every Colors.<token> the app references', () => {
    const used = new Map();
    SOURCE_DIRS.flatMap((dir) => sourceFiles(path.join(ROOT, dir))).forEach((file) => {
      const code = fs.readFileSync(file, 'utf8').replace(/\/\/.*$/gm, '');
      for (const [, token] of code.matchAll(/\bColors\.([A-Za-z_]\w*)/g)) {
        if (!used.has(token)) used.set(token, path.relative(ROOT, file));
      }
    });

    const undefinedTokens = [...used].filter(([token]) => !(token in Colors));
    expect(undefinedTokens).toEqual([]);
  });
});

describe('Fonts', () => {
  it('provides the four font families', () => {
    expect(Object.keys(Fonts).sort()).toEqual(['mono', 'rounded', 'sans', 'serif']);
  });
});
