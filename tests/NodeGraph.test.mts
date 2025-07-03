import { describe, expect, it, beforeEach } from 'vitest';
import { PlantNode } from '../src/PlantNode.mjs';
import { NodeGraph } from '../src/NodeGraph.mjs';

describe('NodeGraph', () => {
  let nodeGraph: NodeGraph;
  let node1: PlantNode;
  let node2: PlantNode;
  let node3: PlantNode;

  beforeEach(() => {
    nodeGraph = new NodeGraph();
    node1 = new PlantNode('Node 1');
    node2 = new PlantNode('Node 2');
    node3 = new PlantNode('Node 3');

    nodeGraph.addNode(node1);
    nodeGraph.addNode(node2);
    nodeGraph.addNode(node3);
  });

  it('should create an instance of NodeGraph', () => {
    expect(nodeGraph).toBeInstanceOf(NodeGraph);
  });

  it('should add a node to the graph', () => {
    expect(nodeGraph.getNodes()).toContain(node1);
  });

  it('should throw an error when adding a relation with a node that is not part of the graph', () => {
    const node4 = new PlantNode('Node 4');
    expect(() => nodeGraph.addRelation(node1, node4, 'relation type')).toThrowError('Both nodes must be part of the graph before adding a relation.');
  });

  it('should not throw an error when adding a relation with both nodes in the graph', () => {
    expect(() => nodeGraph.addRelation(node1, node2, 'relation type')).not.toThrow();
  });

  describe('relations', () => {
    beforeEach(() => {
      nodeGraph.addRelation(node1, node2, 'relation type 1');
      nodeGraph.addRelation(node2, node3, 'relation type 2');
      nodeGraph.addRelation(node1, node3, 'relation type 3');
    });

    it('should return outgoing relations for a node', () => {
      const outgoingRelations = nodeGraph.getOutgoingRelations(node1);
      expect(outgoingRelations.length).toBe(2);
      expect(outgoingRelations).toContainEqual({ source: node1, target: node2, type: 'relation type 1' });
      expect(outgoingRelations).toContainEqual({ source: node1, target: node3, type: 'relation type 3' });
    });

    it('should return incoming relations for a node', () => {
      const incomingRelations = nodeGraph.getIncomingRelations(node3);
      expect(incomingRelations.length).toBe(2);
      expect(incomingRelations).toContainEqual({ source: node1, target: node3, type: 'relation type 3' });
      expect(incomingRelations).toContainEqual({ source: node2, target: node3, type: 'relation type 2' });
    });

    it('should return connected nodes for a node', () => {
      const connectedNodes = nodeGraph.getConnectedNodes(node2);
      expect(connectedNodes.length).toBe(2);
      expect(connectedNodes).toContain(node1);
      expect(connectedNodes).toContain(node3);
    });

    it('should return all relations in the graph', () => {
      const relations = nodeGraph.getRelations();
      expect(relations.length).toBe(3);
      expect(relations).toContainEqual({ source: node1, target: node2, type: 'relation type 1' });
      expect(relations).toContainEqual({ source: node2, target: node3, type: 'relation type 2' });
      expect(relations).toContainEqual({ source: node1, target: node3, type: 'relation type 3' });
    });
  });
});