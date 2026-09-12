import { describe, expect, it } from 'vitest';
import { ARCHIMATE_VERSION } from '../src/archimate/ArchimateVersion.mjs';

describe('ArchimateVersion', () => {
  it('identifies ArchiMate 3.2 as the supported vocabulary version', () => {
    expect(ARCHIMATE_VERSION).toBe('3.2');
  });
});
