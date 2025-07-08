import fs, { writeFileSync } from 'fs';
import { parse } from 'csv';
import { Element } from "../Element.mjs";
import { Element as ArchimateElement } from "../archimate/Element.mjs";
import { Relation } from "../archimate/Relation.mjs";
import { ElementGraph } from "../ElementGraph.mjs";
import { PlantKit } from "../PlantKit.mjs";
import { Diagram } from "../Diagram.mjs";

interface ProcessStep {
    id: string;
    description: string;
    nextStepIds: string[];
    label: string[];
    shape: string;
    function: string;
    phase: string;
    altText: string;
}

class ProcessStepReader {
    public async read(filePath: string): Promise<ProcessStep[]> {
        return new Promise((resolve, reject) => {
            const steps: ProcessStep[] = [];

            fs.createReadStream(filePath)
                .pipe(parse({
                    columns: true,
                    skip_empty_lines: true,
                    delimiter: ';',
                    trim: true
                }))
                .on('data', (row: Record<string, string>) => {
                    const step = this.parseRow(row);
                    if (step) steps.push(step);
                })
                .on('end', () => resolve(steps))
                .on('error', (err) => reject(err));
        });
    }

    private parseRow(row: Record<string, string>): ProcessStep {
        return {
            id: row['Process Step ID'],
            description: row['Process Step Description'],
            nextStepIds: row['Next Step ID'] ? row['Next Step ID'].split(',').map(s => s.trim()) : [],
            label: row['Connector Label'] ? row['Connector Label'].split(',').map(s => s.trim()) : [],
            shape: row['Shape Type'] || '',
            function: row['Function'] || '',
            phase: row['Phase'] || '',
            altText: row['Alt Text'] || ''
        };
    }
}

const t = new ProcessStepReader();
const steps = await t.read('./dump.csv');

// Create the root element
const root: Element = new Element('Root', { type: ArchimateElement.type.Other_Location, label: 'Top-level' });
// Create the element graph
const graph: ElementGraph = new ElementGraph();
graph.addNode(root);

// Add applications to the model
steps.forEach(application => {
    const element = new Element(application.id, { type: ArchimateElement.type.Application_Component, label: application.description });
    graph.addNode(element);
    root.addChild(element);
});

// Add integrations to the element graph
steps.forEach(integration => {
    const source = root.findElement(integration.id)
    if (source) {
        console.log(source.getName())

        for (let i = 0; i < integration.nextStepIds.length; i++) {
            const target = root.findElement(integration.nextStepIds[i])
            if (target) {
                graph.addRelation(source, target, Relation.type.Rel_Flow, { label: integration.label[i] ?? '' });
            }
        }
    }
});

// Create the diagram
const diagram = new Diagram('Demo', 'Demo');
diagram.addInclude('./Archimate.puml');
diagram.autosprite(ArchimateElement.type.Application_Component)
diagram.autosprite(Relation.type.Rel_Flow)

// Add elements and relations to the diagram
const plantkit = new PlantKit();
diagram.addToBody(plantkit.toArchimate(root))
diagram.addToBody(plantkit.toArchimateRelations(graph))

// Output the diagram
writeFileSync('dump.puml', diagram.output());
console.log('Diagram written to dump.puml');
