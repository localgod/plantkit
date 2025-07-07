import { describe, expect, it, beforeEach } from 'vitest';
import { Element } from '../src/Element.mjs';
import { ElementGraph } from '../src/ElementGraph.mjs';

describe('ElementGraph', () => {
  let elementGraph: ElementGraph;
  let node1: Element;
  let node2: Element;
  let node3: Element;

  beforeEach(() => {
    elementGraph = new ElementGraph();
    node1 = new Element('Node 1');
    node2 = new Element('Node 2');
    node3 = new Element('Node 3');

    elementGraph.addNode(node1);
    elementGraph.addNode(node2);
    elementGraph.addNode(node3);
  });

  it('should create an instance of ElementGraph', () => {
    expect(elementGraph).toBeInstanceOf(ElementGraph);
  });

  it('should add a node to the graph', () => {
    expect(elementGraph.getNodes()).toContain(node1);
  });

  it('should throw an error when adding a relation with a node that is not part of the graph', () => {
    const node4 = new Element('Node 4');
    expect(() => elementGraph.addRelation(node1, node4, 'relation type')).toThrowError('Both nodes must be part of the graph before adding a relation.');
  });

  it('should not throw an error when adding a relation with both nodes in the graph', () => {
    expect(() => elementGraph.addRelation(node1, node2, 'relation type')).not.toThrow();
  });

  describe('relations', () => {
    beforeEach(() => {
      elementGraph.addRelation(node1, node2, 'relation type 1');
      elementGraph.addRelation(node2, node3, 'relation type 2');
      elementGraph.addRelation(node1, node3, 'relation type 3');
    });

    it('should return outgoing relations for a node', () => {
      const outgoingRelations = elementGraph.getOutgoingRelations(node1);
      expect(outgoingRelations.length).toBe(2);
      expect(outgoingRelations).toContainEqual({ source: node1, target: node2, type: 'relation type 1' });
      expect(outgoingRelations).toContainEqual({ source: node1, target: node3, type: 'relation type 3' });
    });

    it('should return incoming relations for a node', () => {
      const incomingRelations = elementGraph.getIncomingRelations(node3);
      expect(incomingRelations.length).toBe(2);
      expect(incomingRelations).toContainEqual({ source: node1, target: node3, type: 'relation type 3' });
      expect(incomingRelations).toContainEqual({ source: node2, target: node3, type: 'relation type 2' });
    });

    it('should return connected nodes for a node', () => {
      const connectedNodes = elementGraph.getConnectedNodes(node2);
      expect(connectedNodes.length).toBe(2);
      expect(connectedNodes).toContain(node1);
      expect(connectedNodes).toContain(node3);
    });

    it('should return all relations in the graph', () => {
      const relations = elementGraph.getRelations();
      expect(relations.length).toBe(3);
      expect(relations).toContainEqual({ source: node1, target: node2, type: 'relation type 1' });
      expect(relations).toContainEqual({ source: node2, target: node3, type: 'relation type 2' });
      expect(relations).toContainEqual({ source: node1, target: node3, type: 'relation type 3' });
    });
  });
});