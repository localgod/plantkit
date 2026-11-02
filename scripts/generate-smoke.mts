// Builds smoke-test diagrams through plantkit's public API (the built
// package in ./dist) and writes them as .puml files for PlantUML to render.
//
//   node scripts/generate-smoke.mts [outDir]
//
// The diagrams cover every element type (some nested), every relationship
// type, and labels with quotes, newlines, backslashes and non-ASCII text.
// scripts/smoke-plantuml.sh renders them with -failfast2.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ArchimateElement,
  ArchimateRelation,
  PlantKit,
  canContainElements,
} from '../dist/index.mjs';

const outDir = process.argv[2] ?? 'out/smoke';
const elementTypes = Object.values(ArchimateElement.type);
const relationTypes = Object.values(ArchimateRelation.type);

// Labels that exercise escapePlantUmlString.
const trickyLabels = [
  'Say "hello"',
  'Line one\nLine two',
  'Back\\slash and \\n literal',
  'Ærø · Ünïcødé · 日本語 · 😀',
  'Windows\r\nnewline',
];

function buildKit(options: Record<string, unknown> = {}) {
  const kit = PlantKit.create('smoke test', 'Smoke "test"\nevery type', options);

  // One element of every type. Ids mix case and punctuation to exercise the alias encoding.
  elementTypes.forEach((type, index) => {
    kit.addElement(
      `el-${type}`,
      type,
      `${type.replace('_', ' ')}\n${trickyLabels[index % trickyLabels.length]}`,
    );
  });

  // Ids that used to collide (#242).
  kit
    .addElement('id-AB', 'Business_Object', 'id-AB')
    .addElement('id-ab', 'Business_Object', 'id-ab')
    .addElement('id_ab', 'Business_Object', 'id_ab');

  // Every container type holds one child.
  let leaf = 0;
  for (const type of elementTypes) {
    if (!canContainElements(type)) continue;
    const childId = `child-${leaf++}`;
    kit.addElement(childId, 'Business_Object', `Child of ${type}`).addChild(`el-${type}`, childId);
  }
  // Deeper nesting: Grouping > Business_Actor > Business_Role > child.
  kit
    .addChild('el-Grouping', 'el-Business_Actor')
    .addChild('el-Business_Actor', 'el-Business_Role');

  // Every relationship type, between leaf objects so the arrows do not cross containers.
  relationTypes.forEach((type, index) => {
    const source = `rel-src-${index}`;
    const target = `rel-dst-${index}`;
    kit
      .addElement(source, 'Application_Component', `src ${index}`)
      .addElement(target, 'Application_Component', `dst ${index}`)
      .addRelation(source, target, type, `${type}\n${trickyLabels[index % trickyLabels.length]}`);
  });
  // Notes: attached to one and to several elements, stand-alone, and nested in a group.
  kit
    .addNote('note-attached', 'Owned by the\npayments "team"', { attachTo: 'id-AB' })
    .addNote('note-multi', 'Shared note', { attachTo: ['id-ab', 'id_ab'] })
    .addNote('note-alone', trickyLabels.join('\n'))
    .addNote('note-nested', 'Inside a group')
    .addChild('el-Group', 'note-nested');

  kit
    .addRelation('id-AB', 'id-ab', 'Rel_Association', 'distinct aliases')
    .addRelation('id-ab', 'id_ab', 'Rel_Association', 'distinct aliases');

  return kit;
}

const specialShapes = '!$ARCH_SPECIAL_SHAPES = %true()';
const files: Record<string, string> = {
  'smoke-default.puml': buildKit().generate(),
  // The flag only takes effect before the stdlib include.
  'smoke-special-shapes.puml': buildKit()
    .generate()
    .replace('!include <archimate/Archimate>', `${specialShapes}\n!include <archimate/Archimate>`),
  'smoke-clean.puml': buildKit({
    legend: false,
    sprites: false,
    scale: null,
    layout: null,
  }).generate(),
  // Asks PlantUML's own stdlib whether every type plantkit declares exists there.
  'smoke-stdlib-names.puml': [
    '@startuml stdlib_names',
    '!include <archimate/Archimate>',
    `!foreach $name in [${[...elementTypes, ...relationTypes].map((type) => `"${type}"`).join(', ')}]`,
    '!assert %function_exists($name) : "plantkit type missing from the Archimate stdlib: " + $name',
    '!endfor',
    'rectangle "all plantkit types exist in the stdlib"',
    '@enduml',
  ].join('\n'),
};

mkdirSync(outDir, { recursive: true });
for (const [name, source] of Object.entries(files)) {
  writeFileSync(join(outDir, name), `${source}\n`);
}
console.log(`Wrote ${Object.keys(files).length} smoke diagrams to ${outDir}`);
