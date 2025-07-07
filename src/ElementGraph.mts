import { Element } from "./Element.mjs";
type NodeRelation = {
  source: Element;
  target: Element;
  type: string;
  properties?: { [key: string]: string | number };
};

export class ElementGraph {
  private nodes: Set<Element>;
  private relations: Set<NodeRelation>;

  constructor() {
    this.nodes = new Set();
    this.relations = new Set();
  }

  public addNode(node: Element): void {
    this.nodes.add(node);
  }

  public addRelation(source: Element, target: Element, type: string, properties?: { [key: string]: string | number }): void {
    if (!this.nodes.has(source) || !this.nodes.has(target)) {
      throw new Error("Both nodes must be part of the graph before adding a relation.");
    }
    this.relations.add({ source, target, type, properties });
  }

  public getNodes(): Element[] {
    return Array.from(this.nodes);
  }

  public getRelations(): NodeRelation[] {
    return Array.from(this.relations);
  }

  public getOutgoingRelations(node: Element): NodeRelation[] {
    return Array.from(this.relations).filter(rel => rel.source === node);
  }

  public getIncomingRelations(node: Element): NodeRelation[] {
    return Array.from(this.relations).filter(rel => rel.target === node);
  }

  public getConnectedNodes(node: Element): Element[] {
    const outgoing = this.getOutgoingRelations(node).map(rel => rel.target);
    const incoming = this.getIncomingRelations(node).map(rel => rel.source);
    return [...new Set([...outgoing, ...incoming])];
  }

  
}
