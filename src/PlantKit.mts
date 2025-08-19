import { Element } from './Element.mjs';
import { ArchimateElement } from './archimate/ArchimateElement.mjs';
import { ArchimateRelation } from './archimate/ArchimateRelation.mjs';
import { ElementGraph } from './ElementGraph.mjs';
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

    public printNode(node: Element, indent = 0): void {
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

    public printRelations(nodeGraph: ElementGraph, indent = 0): void {
        const relations = nodeGraph.getRelations();
        if (relations.length > 0) {
            for (const relation of relations) {
                console.log('  '.repeat(indent + 1) + `${relation.source.getName()} -> ${relation.target.getName()} (${relation.type})`);
            }
            console.log('  '.repeat(indent) + '}');
        }
    }

    public printArchimate(node: Element, indent = 0): void {
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
            console.log('  '.repeat(indent) + ArchimateElement(type, name, label) + ' {');
            for (const child of node.getChildren()) {
                this.printArchimate(child, indent + 1);
            }
            console.log('  '.repeat(indent) + '}');
        } else {
            console.log('  '.repeat(indent) + ArchimateElement(type, name, label));
        }
    }

    public toArchimate(node: Element, out: string[] = [], indent = 0): string {
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
            out.push('  '.repeat(indent) + ArchimateElement(type, name, label) + ' {');
            for (const child of node.getChildren()) {
                this.toArchimate(child, out, indent + 1);
            }
            out.push('  '.repeat(indent) + '}')
        } else {
            out.push('  '.repeat(indent) + ArchimateElement(type, name, label));
        }
        return out.join('\n');
    }

    public printArchimateRelations(elementGraph: ElementGraph, indent = 0): void {
        const relations = elementGraph.getRelations();
        if (relations.length > 0) {
            for (const relation of relations) {
                const type = relation.type.toString();
                const source = PlantKit.toValidElementName(relation.source.getName());
                const target = PlantKit.toValidElementName(relation.target.getName());
                const label = relation.properties ? relation.properties['label'].toString() : '';
                console.log('  '.repeat(indent + 1) + ArchimateRelation(type, source, target, label));
            }
        }
    }

    public toArchimateRelations(elementGraph: ElementGraph, indent = 0): string {
        const out: string[] = [];
        const relations = elementGraph.getRelations();
        if (relations.length > 0) {
            for (const relation of relations) {
                const type = relation.type.toString();
                const source = PlantKit.toValidElementName(relation.source.getName());
                const target = PlantKit.toValidElementName(relation.target.getName());
                const label = relation.properties ? relation.properties['label'].toString() : '';
                out.push(' '.repeat(indent + 1) + ArchimateRelation(type, source, target, label));
            }
        }
        return out.join('\n');
    }
}
export { PlantKit }
