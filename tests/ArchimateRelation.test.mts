import { describe, expect, it } from 'vitest';
import { ArchimateRelation } from '../src/archimate/ArchimateRelation.mjs';

describe('ArchimateRelation', () => {
  it('escapes PlantUML string arguments', () => {
    const result = ArchimateRelation(
      ArchimateRelation.type.Rel_Flow,
      'source_"id',
      'target_\\id',
      'Data "flow"\nnext',
    );

    expect(result).toBe('Rel_Flow("source_\\"id", "target_\\\\id","Data \\"flow\\"\\nnext")');
  });
});
