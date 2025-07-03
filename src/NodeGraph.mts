import { PlantNode } from "./PlantNode.mjs";
type NodeRelation = {
  source: PlantNode;
  target: PlantNode;
  type: string;
  properties?: { [key: string]: string | number };
};

export class NodeGraph {
  private nodes: Set<PlantNode>;
  private relations: Set<NodeRelation>;

  constructor() {
    this.nodes = new Set();
    this.relations = new Set();
  }

  public addNode(node: PlantNode): void {
    this.nodes.add(node);
  }

  public addRelation(source: PlantNode, target: PlantNode, type: string, properties?: { [key: string]: string | number }): void {
    if (!this.nodes.has(source) || !this.nodes.has(target)) {
      throw new Error("Both nodes must be part of the graph before adding a relation.");
    }
    this.relations.add({ source, target, type, properties });
  }

  public getNodes(): PlantNode[] {
    return Array.from(this.nodes);
  }

  public getRelations(): NodeRelation[] {
    return Array.from(this.relations);
  }

  public getOutgoingRelations(node: PlantNode): NodeRelation[] {
    return Array.from(this.relations).filter(rel => rel.source === node);
  }

  public getIncomingRelations(node: PlantNode): NodeRelation[] {
    return Array.from(this.relations).filter(rel => rel.target === node);
  }

  public getConnectedNodes(node: PlantNode): PlantNode[] {
    const outgoing = this.getOutgoingRelations(node).map(rel => rel.target);
    const incoming = this.getIncomingRelations(node).map(rel => rel.source);
    return [...new Set([...outgoing, ...incoming])];
  }

  
}
