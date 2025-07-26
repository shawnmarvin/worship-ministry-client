// Basic chord transposition utility
export function transposeChord(chord, steps, useFlats = false, originalKey = 'C') {
  if (!chord || chord.trim() === '') return chord;
  
  const chromaticSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const chromaticFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  const chromatic = useFlats ? chromaticFlat : chromaticSharp;
  
  // Extract root note (first 1-2 characters)
  let root = chord.charAt(0);
  if (chord.length > 1 && (chord.charAt(1) === '#' || chord.charAt(1) === 'b')) {
    root += chord.charAt(1);
  }
  
  // Find current position
  let currentIndex = chromatic.indexOf(root);
  if (currentIndex === -1) return chord; // Invalid chord
  
  // Calculate new position
  let newIndex = (currentIndex + steps + 12) % 12;
  
  // Replace root with new root
  let newRoot = chromatic[newIndex];
  let suffix = chord.substring(root.length);
  
  return newRoot + suffix;
}

export function getCapoChordShape(chord, capo, useFlats = false, originalKey = 'C') {
  if (!chord || capo === 0) return chord;
  
  // Transpose down by capo amount to get the chord shape
  return transposeChord(chord, -capo, useFlats, originalKey);
}