// PlantKit.test.ts
import { describe, expect, it, vi } from 'vitest';
import { PlantKit } from '../src/PlantKit.mjs';
import { Node } from '../src/Node.mjs';
import { Element } from '../src/Element.mjs';

describe('PlantKit', () => {
  it('should create an instance of PlantKit', () => {
    const plantKit = new PlantKit();
    expect(plantKit).toBeInstanceOf(PlantKit);
  });

  it('should have a constructor that does not throw an error', () => {
    expect(() => new PlantKit()).not.toThrow();
  });

  it('should print a node with children', () => {
    const plantKit = new PlantKit();
    const root = new Node('Root');
    const child1 = new Node('Child 1');
    const child2 = new Node('Child 2');
    const grandchild = new Node('Grandchild');

    root.addChild(child1);
    root.addChild(child2);
    child1.addChild(grandchild);

    const consoleSpy = vi.spyOn(console, 'log');
    plantKit.printNode(root);
    expect(consoleSpy.mock.calls).toEqual([
      ['Root {'],
      ['  Child 1 {'],
      ['    Grandchild'],
      ['  }'],
      ['  Child 2'],
      ['}'],
    ]);
  });

  it('should print Archimate diagram', () => {
    const plantKit = new PlantKit();
    const root = new Node('Root', { type: Element.type.Application_Collaboration, label: '<b>Root</b>' });
    const child1 = new Node('Child 1', { type: Element.type.Application_Component, label: '<b>Child 1</b>' });
    const child2 = new Node('Child 2', { type: Element.type.Application_Interface, label: '<b>Child 2</b>' });
    const grandchild = new Node('Grandchild', { type: Element.type.Motivation_Constraint, label: '<b>Grandchild</b>' });

    root.addChild(child1);
    root.addChild(child2);
    child1.addChild(grandchild);
    root.findNode('Grandchild')?.addChild(new Node('jonny', { type: Element.type.Motivation_Constraint, label: '<b>Grandchild</b>' }));

    const consoleSpy = vi.spyOn(console, 'log');
    plantKit.printArchimate(root);
    expect(consoleSpy.mock.calls).toEqual([
      ['Application_Collaboration("ID_root", "<b>Root</b>") {'],
      ['  Application_Component("ID_child_1", "<b>Child 1</b>") {'],
      ['    Motivation_Constraint("ID_grandchild", "<b>Grandchild</b>") {'],
      ['      Motivation_Constraint("ID_jonny", "<b>Grandchild</b>")'],
      ['    }'],
      ['  }'],
      ['  Application_Interface("ID_child_2", "<b>Child 2</b>")'],
      ['}'],
    ]);
  });

});