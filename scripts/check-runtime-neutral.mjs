// Checks that the built package is runtime-neutral: it bundles with
// esbuild's `platform: 'neutral'` without pulling in any `node:` or bare
// import, and it runs in a bare JavaScript context (no Node, DOM or
// network globals, not even `console`).
//
//   npm run build && node scripts/check-runtime-neutral.mjs
import { build } from 'esbuild';
import vm from 'node:vm';

const entry = 'dist/index.mjs';

// Mirrors how ModelForge bundles plantkit into its QuickJS sandbox.
const neutralOptions = {
  entryPoints: [entry],
  bundle: true,
  write: false,
  platform: 'neutral',
  conditions: ['import', 'default'],
  target: 'es2020',
  metafile: true,
  logLevel: 'silent',
};

// 1. ESM bundle: every input must be a file inside the package.
const esm = await build({ ...neutralOptions, format: 'esm' });
const imports = Object.values(esm.metafile.inputs).flatMap((input) => input.imports);
const external = imports.filter(
  (imported) => imported.external || !imported.path.startsWith('dist/'),
);
if (external.length > 0) {
  console.error('The package imports modules outside itself:');
  for (const imported of external) console.error(`  ${imported.path}`);
  process.exit(1);
}
const bytes = esm.outputFiles[0].contents.length;

// 2. IIFE bundle, run in a fresh context that has only the ECMAScript built-ins.
const iife = await build({ ...neutralOptions, format: 'iife', globalName: 'plantkit' });
const context = vm.createContext({});
vm.runInContext(iife.outputFiles[0].text, context);
const output = vm.runInContext(
  `
  const { PlantKit, Diagram, Element, ElementGraph } = plantkit;
  const kit = PlantKit.create('neutral', 'Runtime "neutral"\\ncheck')
    .addElement('id-AB', 'Grouping', 'Group')
    .addElement('id-ab', 'Business_Actor', 'Actor', { alias: 'E1' })
    .addElement('p', 'Business_Process', 'Process')
    .addChild('id-AB', 'id-ab')
    .addRelation('id-ab', 'p', 'Rel_Triggering', 'starts');
  if (kit.validate().length !== 0) throw new Error('unexpected diagnostics');
  const low = new Diagram('low', 'Low level');
  low.addToBody(new PlantKit().toArchimate(new Element('x', { type: 'Business_Object', label: 'X' })));
  const graph = new ElementGraph();
  kit.generate() + '\\n' + low.output() + '\\n' + graph.getNodes().length;
`,
  context,
);

for (const expected of [
  '@startuml neutral',
  'Grouping("ID_id_x2dAB", "Group") {',
  'Rel_Triggering("E1", "ID_p","starts")',
  '@startuml low',
]) {
  if (!output.includes(expected)) {
    console.error(`Generated output inside the bare context is missing: ${expected}\n${output}`);
    process.exit(1);
  }
}

// `console` is only meant for the PlantKit#print* debug helpers; the run above
// proves generation never touches it.
const consoleUses = esm.outputFiles[0].text.match(/\bconsole\.\w+/g) ?? [];
console.log(
  `ok: ${entry} bundles for platform 'neutral' with no external imports (${bytes} bytes)`,
);
console.log(`ok: generates PlantUML in a context without Node, DOM or console globals`);
console.log(
  `info: the bundle has ${consoleUses.length} console calls (the PlantKit#print* debug helpers)`,
);
