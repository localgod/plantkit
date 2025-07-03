export class PlantNode {
  private name: string;
  private properties: { [key: string]: string|number };
  private children: PlantNode[];

  constructor(name: string, properties?: { [key: string]: string|number }) {
    this.name = name;
    this.properties = properties || {};
    this.children = [];
  }

  public addChild(node: PlantNode): void {
    this.children.push(node);
  }

  public getName(): string {
    return this.name;
  }

  public getProperties(): { [key: string]: string|number } {
    return this.properties;
  }

  public getChildren(): PlantNode[] {
    return this.children;
  }

  public findNode(name: string): PlantNode | null {
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