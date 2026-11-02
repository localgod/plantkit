import { describe, expect, it } from 'vite-plus/test';
import {
  escapePlantUmlLine,
  escapePlantUmlString,
  toPlantUmlDiagramName,
} from '../src/archimate/PlantUmlString.mjs';

describe('PlantUmlString', () => {
  it('escapes quotes as <U+0022>, backslashes and every newline style in strings', () => {
    expect(escapePlantUmlString('a"b\\c\nd\r\ne\rf')).toBe('a<U+0022>b\\\\c\\nd\\ne\\nf');
  });

  it('escapes backslashes and newlines but keeps quotes in lines', () => {
    expect(escapePlantUmlLine('a"b\\c\nd\r\ne\rf')).toBe('a"b\\\\c\\nd\\ne\\nf');
  });

  it('reduces diagram names to safe tokens', () => {
    expect(toPlantUmlDiagramName('my view')).toBe('my_view');
    expect(toPlantUmlDiagramName('a/b\\c')).toBe('a_b_c');
    expect(toPlantUmlDiagramName('../etc')).toBe('etc');
    expect(toPlantUmlDiagramName('v1.2-final')).toBe('v1.2-final');
    expect(toPlantUmlDiagramName('  ')).toBe('');
  });
});
