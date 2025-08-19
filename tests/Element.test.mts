import { describe, expect, it, beforeEach } from 'vitest';
import { Element } from '../src/Element.mjs';
describe('Element', () => {
  let node: Element;

  beforeEach(() => {
    node = new Element('Test Node');
  });

  it('should create a new Element with a name', () => {
    expect(node.getName()).toBe('Test Node');
  });

  it('should create a new Element with a name and properties', () => {
    const nodeWithProperties = new Element('Test Node', { test: 'property' });
    expect(nodeWithProperties.getName()).toBe('Test Node');
    expect(nodeWithProperties.getProperties()).toEqual({ test: 'property' });
  });

  describe('children', () => {
    let child1: Element;
    let child2: Element;

    beforeEach(() => {
      child1 = new Element('Child Node 1');
      child2 = new Element('Child Node 2');
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
      expect(node.findElement('Child Node 1')).toBe(child1);
    });

    it('should not find a non-existent child node', () => {
      expect(node.findElement('Non-existent Node')).toBeNull();
    });

    it('should remove a child element recursively', () => {
      const parent = new Element('Parent');
      const child = new Element('Child');
      const grandchild = new Element('Grandchild');
      parent.addChild(child);
      child.addChild(grandchild);
      expect(parent.getChildren()[0].getChildren()).toContain(grandchild);
      parent.removeChild(grandchild.getName());
      expect(parent.getChildren()[0].getChildren()).not.toContain(grandchild);
    });
  });
});
