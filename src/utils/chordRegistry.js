// Chromatic scale for transpositions, using sharps by default
const CHROMATIC_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_SCALE =    ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// Utility for mapping between enharmonic equivalents
const ENHARMONIC_MAP = {
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
  "Ab": "G#",
  "Bb": "A#",
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb"
};

// Returns the index in CHROMATIC_SCALE for a given chord root (e.g. "C", "F#", "Bb")
function getScaleIndex(chord) {
  // Accept both "G#" and "Ab"
  let root = chord.match(/^([A-G][b#]?)/i);
  if (!root) return -1;
  let val = root[1];
  let idx = CHROMATIC_SCALE.indexOf(val);
  if (idx === -1) {
    // Try flat
    idx = FLAT_SCALE.indexOf(val);
    if (idx !== -1) {
      val = CHROMATIC_SCALE[FLAT_SCALE.indexOf(val)];
    }
  }
  return CHROMATIC_SCALE.indexOf(val);
}

// Transpose a single chord up or down by semitones
export function transposeChord(chord, semitones = 0, preferFlats = false) {
  if (!chord || !semitones) return chord;
  // Parse root and suffix
  const match = chord.match(/^([A-G][b#]?)(.*)$/i);
  if (!match) return chord;
  let [_, root, suffix] = match;
  let scale = preferFlats ? FLAT_SCALE : CHROMATIC_SCALE;
  let idx = CHROMATIC_SCALE.indexOf(root);
  if (idx === -1) idx = FLAT_SCALE.indexOf(root);
  if (idx === -1) return chord;

  let newIdx = (idx + semitones + 12) % 12;
  let newRoot = scale[newIdx];

  // Preserve casing
  if (root === root.toLowerCase()) newRoot = newRoot.toLowerCase();

  return newRoot + suffix;
}

// Given a sounding chord and capo position, return the chord shape (open position) you play.
// E.g., getCapoChordShape("A", 2) -> "G" (play G shape with capo 2 to sound A)
export function getCapoChordShape(chord, capo = 0, preferFlats = false) {
  if (!chord || capo === 0) return chord; // No capo, no shape change
  // Parse root and suffix
  const match = chord.match(/^([A-G][b#]?)(.*)$/i);
  if (!match) return chord;
  let [_, root, suffix] = match;
  let scale = preferFlats ? FLAT_SCALE : CHROMATIC_SCALE;
  let idx = CHROMATIC_SCALE.indexOf(root);
  if (idx === -1) idx = FLAT_SCALE.indexOf(root);
  if (idx === -1) return chord;

  // To find the chord shape: move DOWN by capo frets
  // (so at capo 2, play G shape to get A sound, because G + 2 = A)
  let shapeIdx = (idx - capo + 12) % 12;
  let shapeRoot = scale[shapeIdx];

  // Preserve casing
  if (root === root.toLowerCase()) shapeRoot = shapeRoot.toLowerCase();

  return shapeRoot + suffix;
}

// Utility: return both sounding chord and shape for a given capo
export function getChordWithCapo(chord, transpose = 0, capo = 0, preferFlats = false) {
  // First transpose for key change
  const sounding = transposeChord(chord, transpose, preferFlats);
  // Then find shape for capo
  const shape = getCapoChordShape(sounding, capo, preferFlats);
  return { sounding, shape };
}

// Try to guess if chord is sharp/flat preference
export function isFlatChord(chord) {
  return /b/.test(chord);
}
export function isSharpChord(chord) {
  return /#/.test(chord);
}

// Utility: pretty print chord with shape (show only if shape differs from sound)
export function prettyChordWithCapo(chord, transpose, capo, preferFlats = false) {
  const { sounding, shape } = getChordWithCapo(chord, transpose, capo, preferFlats);
  if (capo > 0 && shape !== sounding) {
    return `${sounding} (${shape})`;
  }
  return sounding;
}