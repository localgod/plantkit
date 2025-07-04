

interface Sprite {
    alias: string;
    path: string;
    label?: string
}



class Diagram {
    private name: string;
    private title: string;
    private scale = 1.0;
    private layout = 'left to right direction';
    private body: string[] = [];
    private readonly includes: string[] = [];
    private readonly sprites: Sprite[] = [];

    constructor(name = 'default', title = 'default') {
        this.name = name;
        this.title = title;

    }

    // Method to set the scale of the diagram
    setScale(scale: number): void {
        this.scale = scale;
    }

    // Method to set the name of the diagram
    setName(name: string): void {
        this.name = name;
    }

    // Method to set the title of the diagram
    setTitle(title: string): void {
        this.title = title;
    }

    // Method to set the layout direction of the diagram
    setLayout(layout: string): void {
        this.layout = layout;
    }

    // Method to add an external include file to the diagram
    addInclude(include: string): void {
        this.includes.push(include);
    }

    // Method to add a sprite to the diagram
    addSprite(sprite: Sprite): void {
        if (!this.sprites.some(e => e.alias === sprite.alias && e.path === sprite.path)) {
            this.sprites.push(sprite);
        }
    }

    addToBody(text: string): void {
        this.body.push(text);
    }

    // Method to generate the UML output of the diagram
    output(): string {
        const result: string[] = [];

        // Constructing the UML output
        result.push(`@startuml ${this.name}`);
        this.processIncludes(result);
        this.processSprites(result);
        result.push(`scale ${this.scale}`);
        result.push(`title ${this.title}`);
        result.push(this.body.join('\n'));
        result.push(`${this.layout}`);
        this.addLegend(result);
        result.push(`@enduml`);

        return result.join('\n');
    }

    // Private method to process sprites for UML output
    private processSprites(result: string[]): void {
        this.sprites.forEach(el => {
            result.push(`sprite $${el.alias} jar:archimate/${el.path}`);
        });
    }

    // Auto add sprites for used entity types 
    private autosprite(type: string): void {
        const regex = /^Rel_(.*?)(?:_|$)/i;
        if (type.startsWith('Rel')) {
            const m = type.match(regex)
            type = m ? m[1] : '';
        }
        if (type === 'Realization') {
            type = 'Realisation'
        }
        const alias = `${type}_Sprite`
        const path = `${type.replace('_', '-').toLowerCase()}`
        const label = `${type.replace('_', ' ')}`
        this.addSprite({ alias, path, label })
    }

    // Private method to process includes for UML output
    private processIncludes(result: string[]): void {
        this.includes.forEach(el => {
            result.push(`!include ${el}`);
        });
    }

    // Private method to add a legend to the UML output
    private addLegend(result: string[]): void {
        result.push(`legend left`);
        result.push(`====`);
        this.sprites.forEach(el => {
            result.push(`<$${el.alias}>: ${el.label}`);
        });
        result.push(`endlegend`);
    }
}

export { Diagram, Sprite };
