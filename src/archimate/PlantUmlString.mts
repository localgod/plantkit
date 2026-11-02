/**
 * Escapes text for a double-quoted argument of an Archimate-PlantUML
 * procedure call. Backslashes are doubled, newlines become `\n`, and a
 * double quote becomes `<U+0022>`: PlantUML rejects `\"` in these calls
 * ("unquoted function/procedure cannot use expression").
 */
export function escapePlantUmlString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '<U+0022>')
    .replace(/\r?\n|\r/g, '\\n');
}

/**
 * Escapes an element label or note text. PlantUML rejects an empty quoted
 * label in every Archimate-PlantUML element procedure and in `note`, so an
 * empty value becomes a single space, which renders and draws nothing.
 * Junctions, unnamed groups and empty notes are common in real models.
 */
export function escapePlantUmlLabel(value: string): string {
  return escapePlantUmlString(value) || ' ';
}

/**
 * Escapes text for single-line PlantUML commands such as `title`, where
 * quotes are literal but `\\n` is rendered as a line break.
 */
export function escapePlantUmlLine(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r?\n|\r/g, '\\n');
}

/**
 * Reduces a diagram name to a token that is safe after `@startuml`
 * (PlantUML uses it as the output file name). Returns '' when nothing is left.
 */
export function toPlantUmlDiagramName(value: string): string {
  return value.replace(/[^A-Za-z0-9_.-]+/g, '_').replace(/^[_.]+|_+$/g, '');
}
