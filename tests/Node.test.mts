import { describe, expect, it } from 'vitest';
import { Node } from '../src/Node.mjs';

describe('Node', () => {
  it('should create an instance of Node', () => {
    const node = new Node('Test Node');
    expect(node).toBeInstanceOf(Node);
  });

  it('should have a constructor that does not throw an error', () => {
    expect(() => new Node('Test Node')).not.toThrow();
  });

  it('should have a name property', () => {
    const node = new Node('Test Node');
    expect(node.getName()).toBe('Test Node');
  });

  it('should have a properties property', () => {
    const node = new Node('Test Node', { test: 'property' });
    expect(node.getProperties()).toEqual({ test: 'property' });
  });

  it('should have a children property', () => {
    const node = new Node('Test Node');
    expect(node.getChildren()).toEqual([]);
  });

  it('should add a child node', () => {
    const node = new Node('Test Node');
    const child = new Node('Child Node');
    node.addChild(child);
    expect(node.getChildren()).toEqual([child]);
  });

  it('should find a child node by name', () => {
    const node = new Node('Test Node');
    const child = new Node('Child Node');
    node.addChild(child);
    expect(node.findNode('Child Node')).toBe(child);
  });

  it('should not find a non-existent child node', () => {
    const node = new Node('Test Node');
    expect(node.findNode('Non-existent Node')).toBeNull();
  });
});