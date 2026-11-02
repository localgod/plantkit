import { escapePlantUmlLine, toPlantUmlDiagramName } from './archimate/PlantUmlString.mjs';
import {
  getArchimateSprite,
  isArchimateSpriteType,
  type ArchimateSpriteType,
} from './archimate/ArchimateSprite.mjs';

interface Sprite {
  alias: string;
  path: string;
  label?: string;
}

/** Output options. `null` for `scale` or `layout` means "don't write this line". */
interface DiagramOptions {
  /** Write `scale` (default 1). */
  scale?: number | null;
  /** Layout line (default 'left to right direction'). */
  layout?: string | null;
  /** Write `sprite` declarations (default true). Without sprites there is no legend. */
  sprites?: boolean;
  /** Write a legend of the sprites in use (default true). Omitted when there are no sprites. */
  legend?: boolean;
}

class Diagram {
  private name: string;
  private title: string;
  private scale: number | null = 1.0;
  private layout: string | null = 'left to right direction';
  private spritesEnabled = true;
  private legendEnabled = true;
  private body: string[] = [];
  private generatedBody: string[] = [];
  private readonly includes: string[] = [];
  private libraryInclude: string | null = null;
  private readonly sprites: Sprite[] = [];

  constructor(name = 'default', title = 'default', options: DiagramOptions = {}) {
    this.name = name;
    this.title = title;
    this.setOptions(options);
  }

  setOptions(options: DiagramOptions): void {
    if (options.scale !== undefined) this.setScale(options.scale);
    if (options.layout !== undefined) this.setLayout(options.layout);
    if (options.sprites !== undefined) this.setSprites(options.sprites);
    if (options.legend !== undefined) this.setLegend(options.legend);
  }

  /** `null` omits the `scale` line. */
  setScale(scale: number | null): void {
    this.scale = scale;
  }

  /** Whether `sprite` declarations are written. Without sprites there is no legend. */
  setSprites(enabled: boolean): void {
    this.spritesEnabled = enabled;
  }

  /** Whether the legend is written. It is always omitted when there are no sprites. */
  setLegend(enabled: boolean): void {
    this.legendEnabled = enabled;
  }
  setName(name: string): void {
    this.name = name;
  }

  setTitle(title: string): void {
    this.title = title;
  }
  /** `null` omits the layout line. */
  setLayout(layout: string | null): void {
    this.layout = layout;
  }
  addInclude(include: string): void {
    if (!this.includes.includes(include)) {
      this.includes.push(include);
    }
  }
  /**
   * An include written before all others (the facade uses it for
   * `<archimate/Archimate>`), so later includes can override its macros.
   * `null` removes it.
   */
  setLibraryInclude(include: string | null): void {
    this.libraryInclude = include;
  }
  addSprite(sprite: Sprite): void {
    if (!this.sprites.some((e) => e.alias === sprite.alias && e.path === sprite.path)) {
      this.sprites.push(sprite);
    }
  }
  addToBody(text: string): void {
    this.body.push(text);
  }
  setGeneratedBody(body: string[]): void {
    this.generatedBody = body;
  }
  output(): string {
    const result: string[] = [];
    const name = toPlantUmlDiagramName(this.name);
    result.push(name ? `@startuml ${name}` : '@startuml');
    this.processIncludes(result);
    if (this.spritesEnabled) {
      this.processSprites(result);
    }
    if (this.scale !== null) {
      result.push(`scale ${this.scale}`);
    }
    if (this.title.trim()) {
      result.push(`title ${escapePlantUmlLine(this.title)}`);
    }
    result.push(...[...this.body, ...this.generatedBody].filter((text) => text !== ''));
    if (this.layout !== null && this.layout.trim() !== '') {
      result.push(this.layout);
    }
    if (this.spritesEnabled && this.legendEnabled && this.sprites.length > 0) {
      this.addLegend(result);
    }
    result.push(`@enduml`);
    return result.join('\n');
  }

  private processSprites(result: string[]): void {
    this.sprites.forEach((el) => {
      result.push(`sprite $${el.alias} jar:archimate/${el.path}`);
    });
  }

  public autosprite(type: ArchimateSpriteType): void {
    if (!isArchimateSpriteType(type)) {
      throw new Error(`Unknown ArchiMate sprite type: ${String(type)}`);
    }
    this.addSprite(getArchimateSprite(type));
  }

  private processIncludes(result: string[]): void {
    const includes =
      this.libraryInclude === null
        ? this.includes
        : [
            this.libraryInclude,
            ...this.includes.filter((include) => include !== this.libraryInclude),
          ];
    includes.forEach((el) => {
      result.push(`!include ${el}`);
    });
  }

  private addLegend(result: string[]): void {
    result.push(`legend left`);
    result.push(`Legend`);
    result.push(`====`);
    this.sprites.forEach((el) => {
      result.push(`<$${el.alias}>: ${el.label}`);
    });
    result.push(`endlegend`);
  }
}

export { Diagram, type Sprite, type DiagramOptions };
