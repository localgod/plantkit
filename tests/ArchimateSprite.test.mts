import { describe, expect, it } from 'vitest';
import { ArchimateElement, type ArchimateElementType } from '../src/archimate/ArchimateElement.mjs';
import { ArchimateRelation, type ArchimateRelationType } from '../src/archimate/ArchimateRelation.mjs';
import { getArchimateSprite } from '../src/archimate/ArchimateSprite.mjs';

describe('ArchimateSprite', () => {
  it('maps every supported element type to a sprite', () => {
    for (const type of Object.values(ArchimateElement.type) as ArchimateElementType[]) {
      const sprite = getArchimateSprite(type);

      expect(sprite.alias).toMatch(/_Sprite$/);
      expect(sprite.path).not.toBe('');
      expect(sprite.label).not.toBe('');
    }
  });

  it('maps every supported relationship type to a sprite', () => {
    for (const type of Object.values(ArchimateRelation.type) as ArchimateRelationType[]) {
      const sprite = getArchimateSprite(type);

      expect(sprite.alias).toMatch(/_Sprite$/);
      expect(sprite.path).not.toBe('');
      expect(sprite.label).not.toBe('');
    }
  });
});
