import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { PlantKit } from '../src/PlantKit.mjs';
import { PlantNode } from '../src/PlantNode.mjs';
import { Element } from '../src/archimate/Element.mjs';
import { NodeGraph } from '../src/NodeGraph.mjs';
import { Relation } from '../src/archimate/Relation.mjs';

describe('PlantKit', () => {
  let plantKit: PlantKit;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    plantKit = new PlantKit();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('creates an instance without throwing', () => {
    expect(() => new PlantKit()).not.toThrow();
    expect(plantKit).toBeInstanceOf(PlantKit);
  });


  describe('printNode', () => {
    it('prints hierarchical node tree correctly', () => {
      const root = new PlantNode('Root');
      const child1 = new PlantNode('Child 1');
      const child2 = new PlantNode('Child 2');
      const grandchild = new PlantNode('Grandchild');

      root.addChild(child1);
      root.addChild(child2);
      child1.addChild(grandchild);

      plantKit.printNode(root);

      expect(consoleSpy).toHaveBeenCalledTimes(6);
      expect(consoleSpy).toHaveBeenCalledWith('Root {');
      expect(consoleSpy).toHaveBeenCalledWith('  Child 1 {');
      expect(consoleSpy).toHaveBeenCalledWith('    Grandchild');
      expect(consoleSpy).toHaveBeenCalledWith('  }');
      expect(consoleSpy).toHaveBeenCalledWith('  Child 2');
      expect(consoleSpy).toHaveBeenCalledWith('}');
    });
  });

  describe('Archimate printing', () => {
    let nodeGraph: NodeGraph;
    let root: PlantNode;
    let child1: PlantNode;
    let child2: PlantNode;
    let grandchild: PlantNode;
    let deepChild: PlantNode;

    beforeEach(() => {
      nodeGraph = new NodeGraph();

      root = new PlantNode('Root', {
        type: Element.type.Application_Collaboration,
        label: '<b>Root</b>',
      });

      child1 = new PlantNode('Child 1', {
        type: Element.type.Application_Component,
        label: '<b>Child 1</b>',
      });

      child2 = new PlantNode('Child 2', {
        type: Element.type.Application_Interface,
        label: '<b>Child 2</b>',
      });

      grandchild = new PlantNode('Grandchild', {
        type: Element.type.Motivation_Constraint,
        label: '<b>Grandchild</b>',
      });

      deepChild = new PlantNode('jonny', {
        type: Element.type.Motivation_Constraint,
        label: '<b>Grandchild</b>',
      });

      root.addChild(child1);
      root.addChild(child2);
      child1.addChild(grandchild);
      grandchild.addChild(deepChild);

      nodeGraph.addNode(root);
      nodeGraph.addNode(child1);
      nodeGraph.addNode(child2);
      nodeGraph.addNode(grandchild);
      nodeGraph.addNode(deepChild);

      nodeGraph.addRelation(root, child1, Relation.type.Rel_Flow, { label: 'Access' });
      nodeGraph.addRelation(root, child2, Relation.type.Rel_Flow, { label: 'Access' });
      nodeGraph.addRelation(child1, grandchild, Relation.type.Rel_Access, { label: 'Access' });
    });

    it('prints Archimate relations correctly', () => {
      plantKit.printArchimateRelations(nodeGraph);

      expect(consoleSpy).toHaveBeenCalledWith('  Rel_Flow("ID_root", "ID_child_1","Access")');
      expect(consoleSpy).toHaveBeenCalledWith('  Rel_Flow("ID_root", "ID_child_2","Access")');
      expect(consoleSpy).toHaveBeenCalledWith('  Rel_Access("ID_child_1", "ID_grandchild","Access")');
    });

    it('prints Archimate node structure with children', () => {
      plantKit.printArchimate(root);

      expect(consoleSpy).toHaveBeenCalledWith('Application_Collaboration("ID_root", "<b>Root</b>") {');
      expect(consoleSpy).toHaveBeenCalledWith('  Application_Component("ID_child_1", "<b>Child 1</b>") {');
      expect(consoleSpy).toHaveBeenCalledWith('    Motivation_Constraint("ID_grandchild", "<b>Grandchild</b>") {');
      expect(consoleSpy).toHaveBeenCalledWith('      Motivation_Constraint("ID_jonny", "<b>Grandchild</b>")');
      expect(consoleSpy).toHaveBeenCalledWith('    }');
      expect(consoleSpy).toHaveBeenCalledWith('  }');
      expect(consoleSpy).toHaveBeenCalledWith('  Application_Interface("ID_child_2", "<b>Child 2</b>")');
      expect(consoleSpy).toHaveBeenCalledWith('}');
    });
  });

  describe('Edge cases', () => {
    it('handles nodes without label or type gracefully', () => {
      const root = new PlantNode('EmptyNode');
      expect(() => plantKit.printArchimate(root)).not.toThrow();
    });
  });
});

it('should create a new PlantKit instance', () => {
  const plantKit = new PlantKit();
  expect(plantKit).toBeInstanceOf(PlantKit);
});

describe('printNode', () => {
  let plantKit: PlantKit;
  let node: PlantNode;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    plantKit = new PlantKit();
    node = new PlantNode('Test Node');
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should print a node with no children', () => {

    plantKit.printNode(node);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Test Node');
  });

  it('should print a node with children', () => {
    const child1 = new PlantNode('Child Node 1');
    const child2 = new PlantNode('Child Node 2');
    node.addChild(child1);
    node.addChild(child2);


    plantKit.printNode(node);
    expect(consoleSpy).toHaveBeenCalledTimes(4);
    expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Test Node {');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, '  Child Node 1');
    expect(consoleSpy).toHaveBeenNthCalledWith(3, '  Child Node 2');
  });
});
