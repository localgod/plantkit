import { describe, expect, it, beforeEach } from 'vitest';
import { PlantNode } from '../src/PlantNode.mjs';
describe('PlantNode', () => {
  let node: PlantNode;

  beforeEach(() => {
    node = new PlantNode('Test Node');
  });

  it('should create a new PlantNode with a name', () => {
    expect(node.getName()).toBe('Test Node');
  });

  it('should create a new PlantNode with a name and properties', () => {
    const nodeWithProperties = new PlantNode('Test Node', { test: 'property' });
    expect(nodeWithProperties.getName()).toBe('Test Node');
    expect(nodeWithProperties.getProperties()).toEqual({ test: 'property' });
  });

  describe('children', () => {
    let child1: PlantNode;
    let child2: PlantNode;

    beforeEach(() => {
      child1 = new PlantNode('Child Node 1');
      child2 = new PlantNode('Child Node 2');
      node.addChild(child1);
      node.addChild(child2);
    });

    it('should add a child node to the node', () => {
      expect(node.getChildren()).toContain(child1);
      expect(node.getChildren()).toContain(child2);
    });

    it('should return the children of the node', () => {
      expect(node.getChildren()).toEqual([child1, child2]);
    });

    it('should find a child node by name', () => {
      expect(node.findNode('Child Node 1')).toBe(child1);
    });

    it('should not find a non-existent child node', () => {
      expect(node.findNode('Non-existent Node')).toBeNull();
    });
  });
});