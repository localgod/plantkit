// PlantKit.test.ts
import { describe, expect, it } from 'vitest';
import { PlantKit } from '../src/PlantKit.mjs';

describe('PlantKit', () => {
  it('should create an instance of PlantKit', () => {
    const plantKit = new PlantKit();
    expect(plantKit).toBeInstanceOf(PlantKit);
  });

  it('should have a constructor that does not throw an error', () => {
    expect(() => new PlantKit()).not.toThrow();
  });
});