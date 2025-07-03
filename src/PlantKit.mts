import { PlantNode } from './PlantNode.mjs';
import { Element } from './archimate/Element.mjs';
import { Relation } from './archimate/Relation.mjs';
import { NodeGraph } from './NodeGraph.mjs';
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

    public printNode(node: PlantNode, indent = 0): void {
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

    public printRelations(nodeGraph: NodeGraph, indent = 0): void {
        const relations = nodeGraph.getRelations();
        if (relations.length > 0) {
            for (const relation of relations) {
                console.log('  '.repeat(indent + 1) + `${relation.source.getName()} -> ${relation.target.getName()} (${relation.type})`);
            }
            console.log('  '.repeat(indent) + '}');
        }
    }

    public printArchimate(node: PlantNode, indent = 0): void {
        const children = node.getChildren();
        const name = PlantKit.toValidElementName(node.getName());
        const properties = node.getProperties();
        let type = "";
        if (Object.prototype.hasOwnProperty.call(properties, "type")) {
            type = properties['type'].toString();
        }
        let label: string = "";
        if (Object.prototype.hasOwnProperty.call(properties, "label")) {
            label = properties['label'].toString();
        }

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

    public printArchimateRelations(nodeGraph: NodeGraph, indent = 0): void {
        const relations = nodeGraph.getRelations();
        if (relations.length > 0) {
            for (const relation of relations) {
                const type = relation.type.toString();
                const source = PlantKit.toValidElementName(relation.source.getName());
                const target = PlantKit.toValidElementName(relation.target.getName());
                const label = relation.properties ? relation.properties['label'].toString() : '';
                console.log('  '.repeat(indent + 1) + Relation(type, source, target, label));
            }
        }
    }
}

export { PlantKit }