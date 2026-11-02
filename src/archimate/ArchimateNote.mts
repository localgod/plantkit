import { escapePlantUmlLabel } from './PlantUmlString.mjs';

/** The `type` property that marks an `Element` as a note rather than an ArchiMate element. */
export const NOTE_TYPE = 'Note';

/** Writes a free-standing note: `note "text" as alias`. */
export function ArchimateNote(alias: string, text: string): string {
  return `note "${escapePlantUmlLabel(text)}" as ${alias}`;
}

/** Writes the dotted connector that attaches a note to an element. */
export function ArchimateNoteLink(noteAlias: string, targetAlias: string): string {
  return `${noteAlias} .. ${targetAlias}`;
}
