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

     setScale(scale: number): void {
        this.scale = scale;
    }
    setName(name: string): void {
        this.name = name;
    }

    setTitle(title: string): void {
        this.title = title;
    }
    setLayout(layout: string): void {
        this.layout = layout;
    }
    addInclude(include: string): void {
        this.includes.push(include);
    }
    addSprite(sprite: Sprite): void {
        if (!this.sprites.some(e => e.alias === sprite.alias && e.path === sprite.path)) {
            this.sprites.push(sprite);
        }
    }
    addToBody(text: string): void {
        this.body.push(text);
    }
    output(): string {
        const result: string[] = [];
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

    private processSprites(result: string[]): void {
        this.sprites.forEach(el => {
            result.push(`sprite $${el.alias} jar:archimate/${el.path}`);
        });
    }

    public autosprite(type: string): void {
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

    private processIncludes(result: string[]): void {
        this.includes.forEach(el => {
            result.push(`!include ${el}`);
        });
    }

    private addLegend(result: string[]): void {

        result.push(`legend left`);
        result.push(`Legend`);
        result.push(`====`);
        this.sprites.forEach(el => {
            result.push(`<$${el.alias}>: ${el.label}`);
        });
        result.push(`endlegend`);
    }
}

export { Diagram, Sprite };
