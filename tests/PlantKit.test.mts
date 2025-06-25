// PlantKit.test.ts
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { PlantKit } from '../src/PlantKit.mjs';
import { PlanNode } from '../src/PlanNode.mjs';
import { Element } from '../src/Element.mjs';
import { NodeGraph } from '../src/NodeGraph.mjs';
import { Relation } from '../src/Relation.mjs';

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
      const root = new PlanNode('Root');
      const child1 = new PlanNode('Child 1');
      const child2 = new PlanNode('Child 2');
      const grandchild = new PlanNode('Grandchild');

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
    let root: PlanNode;
    let child1: PlanNode;
    let child2: PlanNode;
    let grandchild: PlanNode;
    let deepChild: PlanNode;

    beforeEach(() => {
      nodeGraph = new NodeGraph();

      root = new PlanNode('Root', {
        type: Element.type.Application_Collaboration,
        label: '<b>Root</b>',
      });

      child1 = new PlanNode('Child 1', {
        type: Element.type.Application_Component,
        label: '<b>Child 1</b>',
      });

      child2 = new PlanNode('Child 2', {
        type: Element.type.Application_Interface,
        label: '<b>Child 2</b>',
      });

      grandchild = new PlanNode('Grandchild', {
        type: Element.type.Motivation_Constraint,
        label: '<b>Grandchild</b>',
      });

      deepChild = new PlanNode('jonny', {
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
      const root = new PlanNode('EmptyNode');
      expect(() => plantKit.printArchimate(root)).not.toThrow();
    });
  });
});
