import { describe, expect, it } from 'vitest';
import { PlantKit } from '../src/PlantKit.mjs';
import { plantUmlAvailable, renderPlantUml } from './helpers/plantuml.mjs';

/**
 * These tests render generated output with the real PlantUML jar. They are
 * skipped when Java or ./plantuml.jar is missing; CI installs both with
 * ./support.sh.
 */
describe.runIf(plantUmlAvailable)('Rendering generated output with PlantUML', () => {
  describe.each([true, false])('nested containers with $ARCH_SPECIAL_SHAPES = %s', special => {
    it('renders a Business_Actor and a Business_Service that each contain a child (#245)', () => {
      const kit = PlantKit.create('nest', 'Nesting')
        .addInclude('<archimate/Archimate>')
        .addElement('actor', 'Business_Actor', 'Actor')
        .addElement('role', 'Business_Role', 'Role')
        .addElement('service', 'Business_Service', 'Service')
        .addElement('process', 'Business_Process', 'Process')
        .addElement('value', 'Motivation_Value', 'Value')
        .addElement('goal', 'Motivation_Goal', 'Goal')
        .addChild('actor', 'role')
        .addChild('service', 'process')
        .addChild('value', 'goal');
      // The flag only takes effect when it is set before the stdlib is included.
      const flag = `!$ARCH_SPECIAL_SHAPES = ${special ? '%true()' : '%false()'}`;
      const source = kit.generate().replace('!include <archimate/Archimate>', `${flag}\n!include <archimate/Archimate>`);
      expect(source).toContain(flag);

      const svg = renderPlantUml(source);

      for (const label of ['Actor', 'Role', 'Service', 'Process', 'Value', 'Goal']) {
        expect(svg).toContain(`>${label}<`);
      }
    });
  });
});
