import { isArchimateElementType, type ArchimateElementType } from './ArchimateElement.mjs';
import { isArchimateRelationType, type ArchimateRelationType } from './ArchimateRelation.mjs';

export interface ArchimateSprite {
  alias: string;
  path: string;
  label: string;
}

export type ArchimateSpriteType = ArchimateElementType | ArchimateRelationType;

export function isArchimateSpriteType(type: string): type is ArchimateSpriteType {
  return isArchimateElementType(type) || isArchimateRelationType(type);
}

/** Types whose sprite in PlantUML's archimate set does not follow the `layer-name` pattern. */
const spritePathOverrides: Readonly<Record<string, string>> = {
  Grouping: 'other-grouping',
  Group: 'other-grouping',
  Physical_DistributionNetwork: 'technology-distribution-network',
};

export function getArchimateSprite(type: ArchimateSpriteType): ArchimateSprite {
  const name = type.startsWith('Rel_') ? type.split('_')[1] : type;
  const spriteName = name === 'Realization' ? 'Realisation' : name;

  return {
    alias: `${spriteName}_Sprite`,
    path: spritePathOverrides[spriteName] ?? spriteName.replace('_', '-').toLowerCase(),
    label: spriteName.replace('_', ' '),
  };
}
