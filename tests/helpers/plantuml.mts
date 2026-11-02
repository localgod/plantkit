import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const jar = resolve(import.meta.dirname, '../../plantuml.jar');

/** True when Java and ./plantuml.jar are available (run ./support.sh to install them). */
export const plantUmlAvailable: boolean =
  existsSync(jar) && spawnSync('java', ['-version'], { stdio: 'ignore' }).status === 0;

/**
 * Renders PlantUML source to SVG with -failfast2.
 * Returns the SVG on success, or throws with PlantUML's error output.
 */
export function renderPlantUml(source: string): string {
  const result = spawnSync(
    'java',
    ['-Djava.awt.headless=true', '-jar', jar, '-tsvg', '-failfast2', '-pipe'],
    {
      input: source,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `PlantUML failed (exit ${result.status}):\n${result.stderr}${result.stdout.slice(0, 2000)}\n--- source ---\n${source}`,
    );
  }
  return result.stdout;
}
