export class PlanNode {
  private name: string;
  private properties: { [key: string]: string|number };
  private children: PlanNode[];

  constructor(name: string, properties?: { [key: string]: string|number }) {
    this.name = name;
    this.properties = properties || {};
    this.children = [];
  }

  public addChild(node: PlanNode): void {
    this.children.push(node);
  }

  public getName(): string {
    return this.name;
  }

  public getProperties(): { [key: string]: string|number } {
    return this.properties;
  }

  public getChildren(): PlanNode[] {
    return this.children;
  }

  public findNode(name: string): PlanNode | null {
    if (this.name === name) {
      return this;
    }
    for (const child of this.children) {
      const node = child.findNode(name);
      if (node) {
        return node;
      }
    }
    return null;
  }
}