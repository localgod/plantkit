import { Element } from './Element.mjs';
import { ArchimateElement } from './archimate/ArchimateElement.mjs';
import { ArchimateRelation } from './archimate/ArchimateRelation.mjs';
import { ElementGraph } from './ElementGraph.mjs';
import { Diagram } from './Diagram.mjs';

class PlantKit {
    private diagramInstance?: Diagram;
    private graphInstance?: ElementGraph;
    private elements?: Map<string, Element>;

    constructor(name?: string, title?: string) {
        if (name && title) {
            this.diagramInstance = new Diagram(name, title);
            this.graphInstance = new ElementGraph();
            this.elements = new Map();
        }
    }

    public static create(name: string, title: string): PlantKit {
        return new PlantKit(name, title);
    }

    public addElement(
        id: string,
        type: string,
        label: string,
        properties?: { [key: string]: string | number }
    ): this {
        if (!this.elements || !this.graphInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        const element = new Element(id, { type, label, ...properties });
        this.elements.set(id, element);
        this.graphInstance.addNode(element);
        return this;
    }

    public addRelation(
        fromId: string,
        toId: string,
        type: string,
        label?: string
    ): this {
        if (!this.elements || !this.graphInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        const source = this.elements.get(fromId);
        const target = this.elements.get(toId);

        if (!source || !target) {
            throw new Error(`Element not found: ${!source ? fromId : toId}`);
        }

        this.graphInstance.addRelation(source, target, type, label ? { label } : undefined);
        return this;
    }

    public setScale(scale: number): this {
        if (!this.diagramInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        this.diagramInstance.setScale(scale);
        return this;
    }

    public setLayout(layout: string): this {
        if (!this.diagramInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        this.diagramInstance.setLayout(layout);
        return this;
    }

    public addInclude(include: string): this {
        if (!this.diagramInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        this.diagramInstance.addInclude(include);
        return this;
    }

    public autoSprites(): this {
        if (!this.elements || !this.graphInstance || !this.diagramInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        const diagram = this.diagramInstance;
        const graph = this.graphInstance;
        
        this.elements.forEach(element => {
            const type = element.getProperties()['type'];
            if (type) {
                diagram.autosprite(type.toString());
            }
        });

        graph.getRelations().forEach(rel => {
            diagram.autosprite(rel.type);
        });

        return this;
    }

    public generate(): string {
        if (!this.elements || !this.graphInstance || !this.diagramInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        this.autoSprites();

        this.elements.forEach(element => {
            this.diagramInstance!.addToBody(this.toArchimate(element));
        });

        this.diagramInstance.addToBody(this.toArchimateRelations(this.graphInstance));

        return this.diagramInstance.output();
    }

    public get diagram(): Diagram {
        if (!this.diagramInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        return this.diagramInstance;
    }

    public get graph(): ElementGraph {
        if (!this.graphInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        return this.graphInstance;
    }

    public getElement(id: string): Element | undefined {
        if (!this.elements) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        return this.elements.get(id);
    }

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
