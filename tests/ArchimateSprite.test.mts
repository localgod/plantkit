import { describe, expect, it } from 'vite-plus/test';
import { ArchimateElement, type ArchimateElementType } from '../src/archimate/ArchimateElement.mjs';
import {
  ArchimateRelation,
  type ArchimateRelationType,
} from '../src/archimate/ArchimateRelation.mjs';
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

  it('uses the sprite names PlantUML ships for groupings and distribution networks', () => {
    expect(getArchimateSprite('Grouping').path).toBe('other-grouping');
    expect(getArchimateSprite('Group').path).toBe('other-grouping');
    expect(getArchimateSprite('Physical_DistributionNetwork').path).toBe(
      'technology-distribution-network',
    );
  });
});
