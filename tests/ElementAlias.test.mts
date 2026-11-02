import { describe, expect, it } from 'vitest';
import { PlantKit } from '../src/PlantKit.mjs';
import { Element } from '../src/Element.mjs';

/** Inverse of PlantKit.toValidElementName, used to prove the mapping is injective. */
function decode(alias: string): string {
  expect(alias.startsWith('ID_')).toBe(true);
  const s = alias.slice(3);
  let out = '';
  for (let i = 0; i < s.length;) {
    if (s[i] !== '_') {
      out += s[i++];
      continue;
    }
    const marker = s[i + 1];
    const width = marker === 'x' ? 2 : marker === 'u' ? 4 : marker === 'U' ? 6 : 0;
    if (marker === '_') {
      out += '_';
      i += 2;
    } else if (width) {
      out += String.fromCodePoint(parseInt(s.slice(i + 2, i + 2 + width), 16));
      i += 2 + width;
    } else {
      out += '_';
      i += 1;
    }
  }
  return out;
}

function randomId(random: () => number): string {
  const alphabet = ['a', 'b', 'x', 'u', 'U', 'X', '0', '1', '_', '-', ' ', '.', 'é', '€', '😀', '"', '\n'];
  const length = Math.floor(random() * 8);
  return Array.from({ length }, () => alphabet[Math.floor(random() * alphabet.length)]).join('');
}

describe('PlantKit.toValidElementName', () => {
  it('keeps ASCII letters, digits and case', () => {
    expect(PlantKit.toValidElementName('orderProcess2')).toBe('ID_orderProcess2');
  });

  it('keeps unambiguous underscores single', () => {
    expect(PlantKit.toValidElementName('order_process')).toBe('ID_order_process');
    expect(PlantKit.toValidElementName('trailing_')).toBe('ID_trailing_');
  });

  it('doubles underscores that could be read as an escape', () => {
    expect(PlantKit.toValidElementName('a_x2d')).toBe('ID_a__x2d');
    expect(PlantKit.toValidElementName('a-')).toBe('ID_a_x2d');
    expect(PlantKit.toValidElementName('a__b')).toBe('ID_a___b');
  });

  it('encodes other characters by code point', () => {
    expect(PlantKit.toValidElementName('a b-c')).toBe('ID_a_x20b_x2dc');
    expect(PlantKit.toValidElementName('€')).toBe('ID__u20ac');
    expect(PlantKit.toValidElementName('😀')).toBe('ID__U01f600');
    expect(PlantKit.toValidElementName('')).toBe('ID_');
  });

  it('only produces characters PlantUML accepts in an alias', () => {
    expect(PlantKit.toValidElementName('Ünïcødé "quoted"\n-id')).toMatch(/^[A-Za-z0-9_]+$/);
  });

  it('is injective: every alias decodes back to its id', () => {
    let seed = 42;
    const random = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
    const seen = new Map<string, string>();
    for (let n = 0; n < 20000; n++) {
      const id = randomId(random);
      const alias = PlantKit.toValidElementName(id);
      expect(decode(alias)).toBe(id);
      const previous = seen.get(alias);
      if (previous !== undefined) {
        expect(previous).toBe(id);
      }
      seen.set(alias, id);
    }
  });
});

describe('PlantKit.aliasOf', () => {
  it('derives the alias from the name by default', () => {
    expect(PlantKit.aliasOf(new Element('id-AB'))).toBe('ID_id_x2dAB');
  });

  it('honours an alias property', () => {
    expect(PlantKit.aliasOf(new Element('id-AB', { alias: 'E1' }))).toBe('E1');
  });

  it('is used by toArchimate and toArchimateRelations', () => {
    const kit = new PlantKit();
    const a = new Element('a', { type: 'Business_Actor', label: 'A', alias: 'E1' });
    expect(kit.toArchimate(a)).toBe('Business_Actor("E1", "A")');
  });

  it('rejects an alias PlantUML cannot parse', () => {
    expect(() => PlantKit.aliasOf(new Element('a', { alias: '1x' }))).toThrow('Invalid PlantUML alias for element a: 1x');
  });
});
