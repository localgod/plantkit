import { describe, expect, it, beforeEach } from 'vitest';
import { Diagram, Sprite } from '../src/Diagram.mjs';

describe('Diagram', () => {
    let diagram: Diagram;

    beforeEach(() => {
        diagram = new Diagram('Test Diagram', 'Test Title');
    });

    it('should create a new Diagram with a name and title', () => {
        const output = diagram.output();
        expect(output).toContain('@startuml Test Diagram');
        expect(output).toContain('title Test Title');
    });

    it('should set the scale of the diagram', () => {
        diagram.setScale(2.0);
        const output = diagram.output();
        expect(output).toContain('scale 2');
    });

    it('should set the layout direction of the diagram', () => {
        diagram.setLayout('right to left direction');
        const output = diagram.output();
        expect(output).toContain('right to left direction');
    });

    it('should add an external include file to the diagram', () => {
        diagram.addInclude('test.include');
        const output = diagram.output();
        expect(output).toContain('!include test.include');
    });

    it('should add a sprite to the diagram', () => {
        const sprite: Sprite = { alias: 'Flow_Sprite', path: 'flow' };
        diagram.addSprite(sprite);
        const output = diagram.output();
        expect(output).toContain('sprite $Flow_Sprite jar:archimate/flow');
    });

    it('uses the Archimate-PlantUML Realisation sprite spelling', () => {
        diagram.autosprite('Rel_Realization');

        expect(diagram.output()).toContain('sprite $Realisation_Sprite jar:archimate/realisation');
    });

    it('rejects an unknown ArchiMate sprite type', () => {
        expect(() => diagram.autosprite('Unknown_Type' as never))
            .toThrow('Unknown ArchiMate sprite type: Unknown_Type');
    });

    it('should add elements to the body of the diagram', () => {
        diagram.addToBody('Business_Role(BU_1, "Customers")');
        diagram.addToBody('Rel_Flow_Down(APP_7, APP_6, "Data")');

        const output = diagram.output();
        expect(output).toContain('Business_Role(BU_1, "Customers');
        expect(output).toContain('Rel_Flow_Down(APP_7, APP_6, "Data")');
    });

    it('preserves manually added body content when generated content is replaced', () => {
        diagram.addToBody('manual content');
        diagram.setGeneratedBody(['first generated content']);
        diagram.setGeneratedBody(['updated generated content']);

        const output = diagram.output();
        expect(output).toContain('manual content');
        expect(output).toContain('updated generated content');
        expect(output).not.toContain('first generated content');
    });


    it('should preserve argument order', () => {
        diagram.setLayout('right to left direction');
        diagram.setScale(2.0);
        diagram.addInclude('test.include');
        diagram.addSprite({ alias: 'Flow_Sprite', path: 'flow' });

        const output = diagram.output();
        const scaleIndex = output.indexOf('scale 2');
        const includeIndex = output.indexOf('!include test.include');
        const spriteIndex = output.indexOf('sprite $Flow_Sprite jar:archimate/flow');
        const layoutIndex = output.indexOf('right to left direction');
        expect(spriteIndex).toBeLessThan(scaleIndex);
        expect(includeIndex).toBeLessThan(scaleIndex);
        expect(layoutIndex).toBeGreaterThan(scaleIndex);
    });
});
