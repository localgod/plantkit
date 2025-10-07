import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { PlantKit } from '../src/PlantKit.mjs';
import { Element } from '../src/Element.mjs';
import { ArchimateElement } from '../src/archimate/ArchimateElement.mjs';
import { ElementGraph } from '../src/ElementGraph.mjs';
import { ArchimateRelation } from '../src/archimate/ArchimateRelation.mjs';

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

  describe('Facade API', () => {
    describe('create', () => {
      it('creates a new PlantKit instance with name and title', () => {
        const kit = PlantKit.create('test-diagram', 'Test Title');
        expect(kit).toBeInstanceOf(PlantKit);
        expect(kit.diagram).toBeDefined();
        expect(kit.graph).toBeDefined();
      });
    });

    describe('addElement', () => {
      it('adds an element and returns this for chaining', () => {
        const kit = PlantKit.create('test', 'Test');
        const result = kit.addElement('customer', 'Business_Actor', 'Customer');
        
        expect(result).toBe(kit);
        const element = kit.getElement('customer');
        expect(element).toBeInstanceOf(Element);
        expect(element?.getName()).toBe('customer');
        expect(element?.getProperties()['type']).toBe('Business_Actor');
        expect(element?.getProperties()['label']).toBe('Customer');
      });

      it('adds element to internal graph', () => {
        const kit = PlantKit.create('test', 'Test');
        kit.addElement('e1', 'Business_Actor', 'Actor');
        
        expect(kit.graph.getNodes()).toHaveLength(1);
      });

      it('stores element in internal map', () => {
        const kit = PlantKit.create('test', 'Test');
        kit.addElement('customer', 'Business_Actor', 'Customer');
        
        const retrieved = kit.getElement('customer');
        expect(retrieved).toBeDefined();
        expect(retrieved?.getName()).toBe('customer');
      });

      it('supports additional properties', () => {
        const kit = PlantKit.create('test', 'Test');
        kit.addElement('db', 'Technology_Node', 'Database', { 
          technology: 'PostgreSQL',
          version: '14.0'
        });
        
        const element = kit.getElement('db');
        expect(element?.getProperties()['technology']).toBe('PostgreSQL');
        expect(element?.getProperties()['version']).toBe('14.0');
      });
    });

    describe('addRelation', () => {
      it('adds a relation between elements', () => {
        const kit = PlantKit.create('test', 'Test');
        kit.addElement('e1', 'Business_Actor', 'Actor 1');
        kit.addElement('e2', 'Business_Process', 'Process 1');
        
        kit.addRelation('e1', 'e2', 'Rel_Triggering', 'initiates');
        
        const relations = kit.graph.getRelations();
        expect(relations).toHaveLength(1);
        expect(relations[0].type).toBe('Rel_Triggering');
      });

      it('returns this for chaining', () => {
        const kit = PlantKit.create('test', 'Test');
        kit.addElement('e1', 'Business_Actor', 'Actor');
        kit.addElement('e2', 'Business_Process', 'Process');
        
        const result = kit.addRelation('e1', 'e2', 'Rel_Flow');
        expect(result).toBe(kit);
      });

      it('throws error if source element not found', () => {
        const kit = PlantKit.create('test', 'Test');
        kit.addElement('e2', 'Business_Process', 'Process');
        
        expect(() => kit.addRelation('e1', 'e2', 'Rel_Flow'))
          .toThrow('Element not found: e1');
      });

      it('throws error if target element not found', () => {
        const kit = PlantKit.create('test', 'Test');
        kit.addElement('e1', 'Business_Actor', 'Actor');
        
        expect(() => kit.addRelation('e1', 'e2', 'Rel_Flow'))
          .toThrow('Element not found: e2');
      });
    });

    describe('fluent API', () => {
      it('supports method chaining', () => {
        const kit = PlantKit.create('test', 'Test')
          .setScale(1.5)
          .setLayout('top to bottom direction')
          .addInclude('./test.puml');
        
        expect(kit).toBeInstanceOf(PlantKit);
      });

      it('chains element and relation additions', () => {
        const output = PlantKit.create('test', 'Test')
          .addElement('e1', 'Business_Actor', 'Actor')
          .addElement('e2', 'Business_Process', 'Process')
          .addRelation('e1', 'e2', 'Rel_Triggering', 'initiates')
          .generate();
        
        expect(output).toContain('@startuml test');
        expect(output).toContain('Business_Actor');
        expect(output).toContain('Business_Process');
      });
    });

    describe('generate', () => {
      it('generates complete PlantUML output', () => {
        const output = PlantKit.create('business-model', 'Business Model')
          .addElement('customer', 'Business_Actor', 'Customer')
          .addElement('orderProcess', 'Business_Process', 'Order Processing')
          .addRelation('customer', 'orderProcess', 'Rel_Triggering', 'initiates')
          .generate();
        
        expect(output).toContain('@startuml business-model');
        expect(output).toContain('title Business Model');
        expect(output).toContain('Business_Actor("ID_customer", "Customer")');
        expect(output).toContain('Business_Process("ID_orderprocess", "Order Processing")');
        expect(output).toContain('Rel_Triggering');
        expect(output).toContain('@enduml');
      });

      it('auto-generates sprites', () => {
        const output = PlantKit.create('test', 'Test')
          .addElement('e1', 'Business_Actor', 'Actor')
          .generate();
        
        expect(output).toContain('sprite $Business_Actor_Sprite');
      });
    });

    describe('diagram access', () => {
      it('provides access to underlying diagram', () => {
        const kit = PlantKit.create('test', 'Test');
        expect(kit.diagram).toBeDefined();
        
        kit.diagram.setScale(2.0);
        const output = kit.generate();
        expect(output).toContain('scale 2');
      });
    });

    describe('graph access', () => {
      it('provides access to underlying graph', () => {
        const kit = PlantKit.create('test', 'Test');
        kit.addElement('e1', 'Business_Actor', 'Actor');
        
        expect(kit.graph).toBeDefined();
        expect(kit.graph.getNodes()).toHaveLength(1);
      });
    });

    describe('getElement', () => {
      it('retrieves element by id', () => {
        const kit = PlantKit.create('test', 'Test');
        kit.addElement('customer', 'Business_Actor', 'Customer');
        
        const element = kit.getElement('customer');
        expect(element).toBeDefined();
        expect(element?.getName()).toBe('customer');
      });

      it('returns undefined for non-existent element', () => {
        const kit = PlantKit.create('test', 'Test');
        const element = kit.getElement('nonexistent');
        expect(element).toBeUndefined();
      });
    });
  });


  describe('printNode', () => {
    it('prints hierarchical node tree correctly', () => {
      const root = new Element('Root');
      const child1 = new Element('Child 1');
      const child2 = new Element('Child 2');
      const grandchild = new Element('Grandchild');

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
    let nodeGraph: ElementGraph;
    let root: Element;
    let child1: Element;
    let child2: Element;
    let grandchild: Element;
    let deepChild: Element;

    beforeEach(() => {
      nodeGraph = new ElementGraph();

      root = new Element('Root', {
        type: ArchimateElement.type.Application_Collaboration,
        label: '<b>Root</b>',
      });

      child1 = new Element('Child 1', {
        type: ArchimateElement.type.Application_Component,
        label: '<b>Child 1</b>',
      });

      child2 = new Element('Child 2', {
        type: ArchimateElement.type.Application_Interface,
        label: '<b>Child 2</b>',
      });

      grandchild = new Element('Grandchild', {
        type: ArchimateElement.type.Motivation_Constraint,
        label: '<b>Grandchild</b>',
      });

      deepChild = new Element('jonny', {
        type: ArchimateElement.type.Motivation_Constraint,
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

      nodeGraph.addRelation(root, child1, ArchimateRelation.type.Rel_Flow, { label: 'Access' });
      nodeGraph.addRelation(root, child2, ArchimateRelation.type.Rel_Flow, { label: 'Access' });
      nodeGraph.addRelation(child1, grandchild, ArchimateRelation.type.Rel_Access, { label: 'Access' });
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
      const root = new Element('EmptyNode');
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
  let node: Element;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    plantKit = new PlantKit();
    node = new Element('Test Node');
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
    const child1 = new Element('Child Node 1');
    const child2 = new Element('Child Node 2');
    node.addChild(child1);
    node.addChild(child2);


    plantKit.printNode(node);
    expect(consoleSpy).toHaveBeenCalledTimes(4);
    expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Test Node {');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, '  Child Node 1');
    expect(consoleSpy).toHaveBeenNthCalledWith(3, '  Child Node 2');
  });
});
