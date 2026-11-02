import { Element } from './Element.mjs';
import { ArchimateElement, canContainElements, isArchimateElementType, type ArchimateElementType } from './archimate/ArchimateElement.mjs';
import { ArchimateRelation, isArchimateRelationType, type ArchimateRelationType } from './archimate/ArchimateRelation.mjs';
import { ArchimateNote, ArchimateNoteLink, NOTE_TYPE } from './archimate/ArchimateNote.mjs';
import { ElementGraph } from './ElementGraph.mjs';
import { Diagram, type DiagramOptions } from './Diagram.mjs';

/** The Archimate-PlantUML standard library include written by the facade by default. */
export const ARCHIMATE_STDLIB_INCLUDE = '<archimate/Archimate>';

export interface PlantKitOptions extends DiagramOptions {
    /**
     * Write `!include <archimate/Archimate>` (default true). Turn it off when
     * you include your own copy or theme with `addInclude()`.
     */
    include?: boolean;
}

export interface NoteOptions {
    /** Id(s) of the element(s) the note is connected to with a dotted line. */
    attachTo?: string | string[];
}

export interface ValidationDiagnostic {
    code: 'ELEMENT_TYPE_MISSING' | 'ELEMENT_TYPE_UNKNOWN' | 'ELEMENT_ALIAS_INVALID' | 'ELEMENT_ALIAS_DUPLICATE' | 'ELEMENT_HIERARCHY_CYCLE' | 'ELEMENT_MULTIPLE_PARENTS' | 'ELEMENT_CANNOT_CONTAIN' | 'GRAPH_NODE_UNMANAGED' | 'RELATION_TYPE_UNKNOWN' | 'RELATION_ENDPOINT_UNKNOWN';
    message: string;
}

class PlantKit {
    private diagramInstance?: Diagram;
    private graphInstance?: ElementGraph;
    private elements?: Map<string, Element>;
    private readonly aliases = new Map<string, string>();
    private readonly noteLinks: Array<{ note: Element; target: Element }> = [];

    constructor(name?: string, title?: string, options: PlantKitOptions = {}) {
        if (name !== undefined && title !== undefined) {
            this.diagramInstance = new Diagram(name, title, options);
            this.diagramInstance.setLibraryInclude(options.include === false ? null : ARCHIMATE_STDLIB_INCLUDE);
            this.graphInstance = new ElementGraph();
            this.elements = new Map();
        }
    }

    public static create(name: string, title: string, options: PlantKitOptions = {}): PlantKit {
        return new PlantKit(name, title, options);
    }

    public addElement(
        id: string,
        type: ArchimateElementType,
        label: string,
        properties?: { [key: string]: string | number }
    ): this {
        if (!this.elements || !this.graphInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        if (!isArchimateElementType(type)) {
            throw new Error(`Unknown ArchiMate element type: ${type}`);
        }
        if (this.elements.has(id)) {
            throw new Error(`Duplicate element id: ${id}`);
        }
        if (properties && ('type' in properties || 'label' in properties)) {
            throw new Error('Element properties cannot override type or label');
        }
        const element = new Element(id, { type, label, ...properties });
        this.register(element);
        this.graphInstance.addNode(element);
        return this;
    }

    /**
     * Adds a note. The text is escaped like labels (newlines become line
     * breaks). With `attachTo`, the note is connected to those elements by a
     * dotted line; without it, the note stands alone. Like an element, a note
     * can be nested with `addChild(groupId, noteId)`. Pass `{ alias }` in
     * `properties` to choose its PlantUML alias.
     */
    public addNote(
        id: string,
        text: string,
        options: NoteOptions = {},
        properties?: { [key: string]: string | number }
    ): this {
        if (!this.elements) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        if (this.elements.has(id)) {
            throw new Error(`Duplicate element id: ${id}`);
        }
        if (properties && ('type' in properties || 'label' in properties)) {
            throw new Error('Note properties cannot override type or label');
        }
        const attachTo = options.attachTo === undefined ? [] : ([] as string[]).concat(options.attachTo);
        const targets = attachTo.map(targetId => {
            const target = this.elements?.get(targetId);
            if (!target) {
                throw new Error(`Element not found: ${targetId}`);
            }
            return target;
        });
        const note = new Element(id, { type: NOTE_TYPE, label: text, ...properties });
        this.register(note);
        targets.forEach(target => this.noteLinks.push({ note, target }));
        return this;
    }

    private register(element: Element): void {
        const alias = PlantKit.aliasOf(element);
        const owner = this.aliases.get(alias);
        if (owner !== undefined) {
            throw new Error(`Duplicate PlantUML element alias: ${alias} (already used by ${owner})`);
        }
        this.aliases.set(alias, element.getName());
        this.elements!.set(element.getName(), element);
    }

    public addRelation(
        fromId: string,
        toId: string,
        type: ArchimateRelationType,
        label?: string
    ): this {
        if (!this.elements || !this.graphInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        if (!isArchimateRelationType(type)) {
            throw new Error(`Unknown ArchiMate relationship type: ${type}`);
        }
        const source = this.elements.get(fromId);
        const target = this.elements.get(toId);

        if (!source || !target) {
            throw new Error(`Element not found: ${!source ? fromId : toId}`);
        }
        if (PlantKit.isNote(source) || PlantKit.isNote(target)) {
            throw new Error(`Notes cannot be relationship endpoints: use addNote(id, text, { attachTo }) instead`);
        }

        this.graphInstance.addRelation(source, target, type, label ? { label } : undefined);
        return this;
    }

    /**
     * Nests the element `childId` inside `parentId`. An element can have only
     * one parent, and the hierarchy cannot contain cycles.
     */
    public addChild(parentId: string, childId: string): this {
        if (!this.elements) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        const parent = this.elements.get(parentId);
        const child = this.elements.get(childId);
        if (!parent || !child) {
            throw new Error(`Element not found: ${!parent ? parentId : childId}`);
        }
        const parentType = parent.getProperties()['type']?.toString();
        if (parentType === NOTE_TYPE || (parentType && isArchimateElementType(parentType) && !canContainElements(parentType))) {
            throw new Error(`Element ${parentId} of type ${parentType} cannot contain other elements`);
        }
        if (PlantKit.contains(child, parent)) {
            throw new Error(`Cannot nest ${childId} inside ${parentId}: it would create a cycle`);
        }
        for (const element of this.elements.values()) {
            if (element.getChildren().includes(child)) {
                throw new Error(`Element ${childId} already has a parent: ${element.getName()}`);
            }
        }
        parent.addChild(child);
        return this;
    }

    /** `null` omits the `scale` line. */
    public setScale(scale: number | null): this {
        if (!this.diagramInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        this.diagramInstance.setScale(scale);
        return this;
    }

    /** `null` omits the layout line. */
    public setLayout(layout: string | null): this {
        if (!this.diagramInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        this.diagramInstance.setLayout(layout);
        return this;
    }

    /** Changes output options after creation; see `PlantKitOptions`. */
    public setOptions(options: PlantKitOptions): this {
        if (!this.diagramInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        this.diagramInstance.setOptions(options);
        if (options.include !== undefined) {
            this.diagramInstance.setLibraryInclude(options.include ? ARCHIMATE_STDLIB_INCLUDE : null);
        }
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
            if (type && type !== NOTE_TYPE) {
                const elementType = type.toString();
                if (!isArchimateElementType(elementType)) {
                    throw new Error(`Unknown ArchiMate element type: ${elementType}`);
                }
                diagram.autosprite(elementType);
            }
        });

        graph.getRelations().forEach(rel => {
            if (!isArchimateRelationType(rel.type)) {
                throw new Error(`Unknown ArchiMate relationship type: ${rel.type}`);
            }
            diagram.autosprite(rel.type);
        });

        return this;
    }

    public validate(): ValidationDiagnostic[] {
        if (!this.elements || !this.graphInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }

        const diagnostics: ValidationDiagnostic[] = [];
        const graphElements = new Set(this.elements.values());

        this.graphInstance.getNodes().forEach(node => {
            if (!graphElements.has(node)) {
                diagnostics.push({
                    code: 'GRAPH_NODE_UNMANAGED',
                    message: `Graph node ${node.getName()} is not managed by this PlantKit instance`,
                });
            }
        });

        const aliasOwners = new Map<string, string>();
        this.elements.forEach(element => {
            let alias: string;
            try {
                alias = PlantKit.aliasOf(element);
            } catch (error) {
                diagnostics.push({ code: 'ELEMENT_ALIAS_INVALID', message: (error as Error).message });
                return;
            }
            const owner = aliasOwners.get(alias);
            if (owner !== undefined) {
                diagnostics.push({
                    code: 'ELEMENT_ALIAS_DUPLICATE',
                    message: `Elements ${owner} and ${element.getName()} share the PlantUML alias ${alias}`,
                });
            } else {
                aliasOwners.set(alias, element.getName());
            }
        });

        this.elements.forEach(element => {
            const type = element.getProperties()['type']?.toString();
            if (type === NOTE_TYPE) {
                if (element.getChildren().length > 0) {
                    diagnostics.push({
                        code: 'ELEMENT_CANNOT_CONTAIN',
                        message: `Note ${element.getName()} cannot contain other elements`,
                    });
                }
            } else if (!type) {
                diagnostics.push({
                    code: 'ELEMENT_TYPE_MISSING',
                    message: `Element ${element.getName()} has no ArchiMate type`,
                });
            } else if (!isArchimateElementType(type)) {
                diagnostics.push({
                    code: 'ELEMENT_TYPE_UNKNOWN',
                    message: `Element ${element.getName()} has unknown ArchiMate type: ${type}`,
                });
            } else if (element.getChildren().length > 0 && !canContainElements(type)) {
                diagnostics.push({
                    code: 'ELEMENT_CANNOT_CONTAIN',
                    message: `Element ${element.getName()} of type ${type} cannot contain other elements`,
                });
            }
        });

        diagnostics.push(...PlantKit.hierarchyDiagnostics(Array.from(this.elements.values())));

        this.graphInstance.getRelations().forEach(relation => {
            if (!isArchimateRelationType(relation.type)) {
                diagnostics.push({
                    code: 'RELATION_TYPE_UNKNOWN',
                    message: `Relationship has unknown ArchiMate type: ${relation.type}`,
                });
            }
            if (!graphElements.has(relation.source) || !graphElements.has(relation.target)) {
                diagnostics.push({
                    code: 'RELATION_ENDPOINT_UNKNOWN',
                    message: `Relationship endpoint is not managed by this PlantKit instance`,
                });
            }
        });

        return diagnostics;
    }

    public generate(): string {
        if (!this.elements || !this.graphInstance || !this.diagramInstance) {
            throw new Error('PlantKit must be created with create() method to use facade API');
        }
        const diagnostics = this.validate();
        if (diagnostics.length > 0) {
            throw new Error(`Invalid ArchiMate model:\n${diagnostics.map(diagnostic => diagnostic.message).join('\n')}`);
        }
        this.autoSprites();

        const body: string[] = [];
        PlantKit.roots(Array.from(this.elements.values())).forEach(element => {
            body.push(this.toArchimate(element));
        });

        body.push(this.toArchimateRelations(this.graphInstance));
        this.noteLinks.forEach(({ note, target }) => {
            body.push(ArchimateNoteLink(PlantKit.aliasOf(note), PlantKit.aliasOf(target)));
        });
        this.diagramInstance.setGeneratedBody(body);

        return this.diagramInstance.output();
    }

    /** Whether an element is a note (its `type` property is `NOTE_TYPE`). */
    public static isNote(element: Element): boolean {
        return element.getProperties()['type'] === NOTE_TYPE;
    }

    /** Whether `target` is `root` or one of its descendants (compared by identity). */
    private static contains(root: Element, target: Element, seen = new Set<Element>()): boolean {
        if (root === target) {
            return true;
        }
        if (seen.has(root)) {
            return false;
        }
        seen.add(root);
        return root.getChildren().some(child => PlantKit.contains(child, target, seen));
    }

    /** The elements that are not a descendant of any other element in `elements`. */
    public static roots(elements: Element[]): Element[] {
        const descendants = new Set<Element>();
        const visit = (element: Element): void => {
            for (const child of element.getChildren()) {
                if (!descendants.has(child)) {
                    descendants.add(child);
                    visit(child);
                }
            }
        };
        elements.forEach(visit);
        return elements.filter(element => !descendants.has(element));
    }

    private static hierarchyDiagnostics(elements: Element[]): ValidationDiagnostic[] {
        const diagnostics: ValidationDiagnostic[] = [];
        const parents = new Map<Element, Element>();
        const reported = new Set<Element>();
        const visit = (element: Element, ancestors: Element[]): void => {
            for (const child of element.getChildren()) {
                if (ancestors.includes(child) || child === element) {
                    if (!reported.has(child)) {
                        reported.add(child);
                        diagnostics.push({
                            code: 'ELEMENT_HIERARCHY_CYCLE',
                            message: `Element ${child.getName()} is nested inside itself`,
                        });
                    }
                    continue;
                }
                const parent = parents.get(child);
                if (parent === undefined) {
                    parents.set(child, element);
                    visit(child, [...ancestors, element]);
                } else if (parent !== element && !reported.has(child)) {
                    reported.add(child);
                    diagnostics.push({
                        code: 'ELEMENT_MULTIPLE_PARENTS',
                        message: `Element ${child.getName()} has more than one parent: ${parent.getName()}, ${element.getName()}`,
                    });
                }
            }
        };
        elements.forEach(element => visit(element, []));
        return diagnostics;
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

    /**
     * Derives a PlantUML alias from an element id. The mapping is injective:
     * distinct ids always give distinct aliases. ASCII letters and digits are
     * kept as they are (case included). Any other character is written as
     * `_xHH`, `_uHHHH` or `_UHHHHHH` (lowercase hex code point), and an
     * underscore is doubled when it could otherwise be read as the start of
     * such an escape.
     */
    public static toValidElementName(input: string): string {
        const chars = Array.from(input);
        let out = '';
        chars.forEach((char, index) => {
            if (/^[A-Za-z0-9]$/.test(char)) {
                out += char;
            } else if (char === '_') {
                const next = chars[index + 1];
                // The next output character starts an escape (`_`) or is an escape marker.
                const ambiguous = next !== undefined && (!/^[A-Za-z0-9]$/.test(next) || /^[xuU]$/.test(next));
                out += ambiguous ? '__' : '_';
            } else {
                const codePoint = char.codePointAt(0) as number;
                if (codePoint <= 0xff) {
                    out += `_x${codePoint.toString(16).padStart(2, '0')}`;
                } else if (codePoint <= 0xffff) {
                    out += `_u${codePoint.toString(16).padStart(4, '0')}`;
                } else {
                    out += `_U${codePoint.toString(16).padStart(6, '0')}`;
                }
            }
        });
        return `ID_${out}`;
    }

    /** Whether `alias` can be used as a caller-supplied PlantUML alias. */
    public static isValidAlias(alias: string): boolean {
        return /^[A-Za-z_][A-Za-z0-9_]*$/.test(alias);
    }

    /**
     * The PlantUML alias used for an element: its `alias` property when set,
     * otherwise `toValidElementName(name)`.
     */
    public static aliasOf(element: Element): string {
        const alias = element.getProperties()['alias'];
        if (alias === undefined) {
            return PlantKit.toValidElementName(element.getName());
        }
        const value = alias.toString();
        if (!PlantKit.isValidAlias(value)) {
            throw new Error(`Invalid PlantUML alias for element ${element.getName()}: ${value}`);
        }
        return value;
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
        this.toArchimate(node, [], indent).split('\n').forEach(line => console.log(line));
    }

    public toArchimate(node: Element, out: string[] = [], indent = 0): string {
        this.writeArchimate(node, out, indent, new Set());
        return out.join('\n');
    }

    private writeArchimate(node: Element, out: string[], indent: number, ancestors: Set<Element>): void {
        if (ancestors.has(node)) {
            throw new Error(`Element ${node.getName()} is nested inside itself`);
        }
        const children = node.getChildren();
        const name = PlantKit.aliasOf(node);
        const properties = node.getProperties();
        let type = "";
        if (Object.prototype.hasOwnProperty.call(properties, "type")) {
            type = properties['type'].toString();
        }
        let label: string = "";
        if (Object.prototype.hasOwnProperty.call(properties, "label")) {
            label = properties['label'].toString();
        }
        if (type === NOTE_TYPE) {
            if (children.length > 0) {
                throw new Error(`Note ${node.getName()} cannot contain other elements`);
            }
            out.push('  '.repeat(indent) + ArchimateNote(name, label));
            return;
        }
        if (type && !isArchimateElementType(type)) {
            throw new Error(`Unknown ArchiMate element type: ${type}`);
        }
        if (children.length > 0 && type && !canContainElements(type as ArchimateElementType)) {
            throw new Error(`Element ${node.getName()} of type ${type} cannot contain other elements`);
        }

        if (children.length > 0) {
            out.push('  '.repeat(indent) + ArchimateElement(type as ArchimateElementType, name, label, true) + ' {');
            ancestors.add(node);
            for (const child of children) {
                this.writeArchimate(child, out, indent + 1, ancestors);
            }
            ancestors.delete(node);
            out.push('  '.repeat(indent) + '}')
        } else {
            out.push('  '.repeat(indent) + ArchimateElement(type as ArchimateElementType, name, label));
        }
    }

    public printArchimateRelations(elementGraph: ElementGraph, indent = 0): void {
        const relations = elementGraph.getRelations();
        if (relations.length > 0) {
            for (const relation of relations) {
                const type = relation.type.toString();
                if (!isArchimateRelationType(type)) {
                    throw new Error(`Unknown ArchiMate relationship type: ${type}`);
                }
                const source = PlantKit.aliasOf(relation.source);
                const target = PlantKit.aliasOf(relation.target);
                const label = relation.properties?.['label']?.toString() ?? '';
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
                if (!isArchimateRelationType(type)) {
                    throw new Error(`Unknown ArchiMate relationship type: ${type}`);
                }
                const source = PlantKit.aliasOf(relation.source);
                const target = PlantKit.aliasOf(relation.target);
                const label = relation.properties?.['label']?.toString() ?? '';
                out.push(' '.repeat(indent + 1) + ArchimateRelation(type, source, target, label));
            }
        }
        return out.join('\n');
    }
}
export { PlantKit }
