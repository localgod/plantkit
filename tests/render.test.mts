import { describe, expect, it } from 'vitest';
import { PlantKit } from '../src/PlantKit.mjs';
import { ArchimateElement } from '../src/archimate/ArchimateElement.mjs';
import { ArchimateRelation } from '../src/archimate/ArchimateRelation.mjs';
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

  it('renders the default facade output (stdlib include, sprites, legend) without addInclude (#244)', () => {
    const svg = renderPlantUml(PlantKit.create('defaults', 'Defaults')
      .addElement('g', 'Grouping', 'Group A')
      .addElement('h', 'Group', 'Group B')
      .addElement('d', 'Physical_DistributionNetwork', 'Network')
      .addElement('a', 'Business_Actor', 'Actor')
      .addChild('g', 'a')
      .addRelation('a', 'd', 'Rel_Serving', 'uses')
      .generate());
    expect(svg).toContain('>Network<');
  });

  it('renders the clean output with legend, sprites, scale and layout off (#244)', () => {
    renderPlantUml(PlantKit.create('clean', 'Clean', { legend: false, sprites: false, scale: null, layout: null })
      .addElement('a', 'Business_Actor', 'A')
      .addElement('b', 'Business_Process', 'B')
      .addRelation('a', 'b', 'Rel_Triggering_Right', 'starts')
      .generate());
  });

  it('every element and relationship type plantkit declares exists in the bundled stdlib (#246)', () => {
    const names = [...Object.values(ArchimateElement.type), ...Object.values(ArchimateRelation.type)];
    renderPlantUml([
      '@startuml',
      '!include <archimate/Archimate>',
      `!foreach $name in [${names.map(name => `"${name}"`).join(', ')}]`,
      '!assert %function_exists($name) : "missing from the Archimate stdlib: " + $name',
      '!endfor',
      'rectangle ok',
      '@enduml',
    ].join('\n'));
  });

  it('renders labels with quotes, backslashes, newlines and non-ASCII text as written (#246)', () => {
    const label = 'Say "hi" \\ back\\slash \\n literal\nÆrø 😀';
    const svg = renderPlantUml(PlantKit.create('labels', 'Labels', { sprites: false })
      .addElement('a', 'Business_Actor', label)
      .addElement('b', 'Business_Role', 'B')
      .addRelation('a', 'b', 'Rel_Assignment', 'the "role"')
      .generate());

    const text = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(match => match[1]).join(' ').replace(/\s+/g, ' ');
    expect(text).toContain('Say "hi" \\ back\\slash');
    expect(text).toContain('\\n literal');
    expect(text).toContain('Ærø');
    expect(text).toContain('the "role"');
  });

  it('renders attached, stand-alone and nested notes (#248)', () => {
    const svg = renderPlantUml(PlantKit.create('notes', 'Notes')
      .addElement('payments', 'Grouping', 'Payments')
      .addElement('orderProcess', 'Business_Process', 'Order process')
      .addChild('payments', 'orderProcess')
      .addNote('n1', 'Owned by the\npayments "team"', { attachTo: 'orderProcess' })
      .addNote('n2', 'Stand-alone')
      .addNote('n3', 'Inside the group')
      .addChild('payments', 'n3')
      .generate());

    const text = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(match => match[1]).join(' ').replace(/\s+/g, ' ');
    expect(text).toContain('payments "team"');
    expect(text).toContain('Stand-alone');
    expect(text).toContain('Inside the group');
  });
});
