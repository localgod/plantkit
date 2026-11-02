export function escapePlantUmlString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n|\r/g, '\\n');
}

/**
 * Escapes text for single-line PlantUML commands such as `title`, where
 * quotes are literal but `\\n` is rendered as a line break.
 */
export function escapePlantUmlLine(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n|\r/g, '\\n');
}

/**
 * Reduces a diagram name to a token that is safe after `@startuml`
 * (PlantUML uses it as the output file name). Returns '' when nothing is left.
 */
export function toPlantUmlDiagramName(value: string): string {
  return value
    .replace(/[^A-Za-z0-9_.-]+/g, '_')
    .replace(/^[_.]+|_+$/g, '');
}
