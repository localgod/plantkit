import { describe, expect, it, beforeEach } from 'vitest';
import { Diagram, Sprite } from '../src/Diagram.mts';

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

    it('should add elements to the body of the diagram', () => {
        diagram.addToBody('Business_Role(BU_1, "Customers")');
        diagram.addToBody('Rel_Flow_Down(APP_7, APP_6, "Data")');

        const output = diagram.output();
        expect(output).toContain('Business_Role(BU_1, "Customers');
        expect(output).toContain('Rel_Flow_Down(APP_7, APP_6, "Data")');
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