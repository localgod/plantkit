import { Node } from './Node.mjs';
import { Element } from './Element.mjs';
class PlantKit {
    constructor() { }

    public static toValidElementName(input: string): string {
        let transformed = input.toLowerCase();
        transformed = transformed.replace(/[\s-]+/g, '_');
        transformed = transformed.replace(/[^a-z0-9_]/g, '');
        if (!transformed) {
            transformed = "element";
        }
        return `ID_${transformed}`;
    }

    public printNode(node: Node, indent = 0): void {
        const children = node.getChildren();
        if (children.length > 0) {
            console.log('  '.repeat(indent) + node.getName() + ' {');
            for (const child of node.getChildren()) {
                this.printNode(child, indent + 1);
            }
            console.log('  '.repeat(indent) + '}');
        } else {
            console.log('  '.repeat(indent) + node.getName());
        }
    }

    public printArchimate(node: Node, indent = 0): void {
        const children = node.getChildren();
        const type = node.getProperties()['type'].toString();
        const name = PlantKit.toValidElementName(node.getName());
        const label = node.getProperties()['label'].toString();
        if (children.length > 0) {
            console.log('  '.repeat(indent) + Element(type, name, label) + ' {');
            for (const child of node.getChildren()) {
                this.printArchimate(child, indent + 1);
            }
            console.log('  '.repeat(indent) + '}');
        } else {
            console.log('  '.repeat(indent) + Element(type, name, label));
        }
    }
}

export { PlantKit }