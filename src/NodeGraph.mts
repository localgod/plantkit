import { PlanNode } from "./PlanNode.mjs";
type NodeRelation = {
  source: PlanNode;
  target: PlanNode;
  type: string; // Optional: e.g., "uses", "depends_on", etc.
  properties?: { [key: string]: string | number };
};

export class NodeGraph {
  private nodes: Set<PlanNode>;
  private relations: Set<NodeRelation>;

  constructor() {
    this.nodes = new Set();
    this.relations = new Set();
  }

  public addNode(node: PlanNode): void {
    this.nodes.add(node);
  }

  public addRelation(source: PlanNode, target: PlanNode, type: string, properties?: { [key: string]: string | number }): void {
    if (!this.nodes.has(source) || !this.nodes.has(target)) {
      throw new Error("Both nodes must be part of the graph before adding a relation.");
    }
    this.relations.add({ source, target, type, properties });
  }

  public getNodes(): PlanNode[] {
    return Array.from(this.nodes);
  }

  public getRelations(): NodeRelation[] {
    return Array.from(this.relations);
  }

  public getOutgoingRelations(node: PlanNode): NodeRelation[] {
    return Array.from(this.relations).filter(rel => rel.source === node);
  }

  public getIncomingRelations(node: PlanNode): NodeRelation[] {
    return Array.from(this.relations).filter(rel => rel.target === node);
  }

  public getConnectedNodes(node: PlanNode): PlanNode[] {
    const outgoing = this.getOutgoingRelations(node).map(rel => rel.target);
    const incoming = this.getIncomingRelations(node).map(rel => rel.source);
    return [...new Set([...outgoing, ...incoming])];
  }
}
