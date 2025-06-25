import { describe, expect, it } from 'vitest';
import { PlanNode } from '../src/PlanNode.mjs';

describe('Node', () => {
  it('should create an instance of Node', () => {
    const node = new PlanNode('Test Node');
    expect(node).toBeInstanceOf(PlanNode);
  });

  it('should have a constructor that does not throw an error', () => {
    expect(() => new PlanNode('Test Node')).not.toThrow();
  });

  it('should have a name property', () => {
    const node = new PlanNode('Test Node');
    expect(node.getName()).toBe('Test Node');
  });

  it('should have a properties property', () => {
    const node = new PlanNode('Test Node', { test: 'property' });
    expect(node.getProperties()).toEqual({ test: 'property' });
  });

  it('should have a children property', () => {
    const node = new PlanNode('Test Node');
    expect(node.getChildren()).toEqual([]);
  });

  it('should add a child node', () => {
    const node = new PlanNode('Test Node');
    const child = new PlanNode('Child Node');
    node.addChild(child);
    expect(node.getChildren()).toEqual([child]);
  });

  it('should find a child node by name', () => {
    const node = new PlanNode('Test Node');
    const child = new PlanNode('Child Node');
    node.addChild(child);
    expect(node.findNode('Child Node')).toBe(child);
  });

  it('should not find a non-existent child node', () => {
    const node = new PlanNode('Test Node');
    expect(node.findNode('Non-existent Node')).toBeNull();
  });
});