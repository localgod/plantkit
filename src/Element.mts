export class Element {
  private name: string;
  private properties: { [key: string]: string | number };
  private children: Element[];

  constructor(name: string, properties?: { [key: string]: string | number }) {
    this.name = name;
    this.properties = properties || {};
    this.children = [];
  }

  public addChild(node: Element): void {
    this.children.push(node);
  }

  public getName(): string {
    return this.name;
  }

  public getProperties(): { [key: string]: string | number } {
    return this.properties;
  }

  public getChildren(): Element[] {
    return this.children;
  }


   public findElement(name: string): Element | null {
    if (this.name === name) {
      return this;
    }
    for (const child of this.children) {
      const node = child.findElement(name);
      if (node) {
        return node;
      }
    }
    return null;
  }

  public removeChild(name: string): void {
    this.removeChildRecursive(this, name);
  }

  private removeChildRecursive(parent: Element, name: string): void {
    for (const child of parent.children) {
      if (child.name === name) {
        parent.children = parent.children.filter(c => c !== child);
      } else {
        this.removeChildRecursive(child, name);
      }
    }
  }
}
