export function parseChordProLines(text) {
    const lines = text.split(/\r?\n/);
    const result = [];
    let i = 0;
    let currentSection = null;
  
    while (i < lines.length) {
      const line = lines[i].trim();
  
      // Section header [Intro]
      const sectionMatch = /^\[(.+)\]$/.exec(line);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        result.push({ section: currentSection });
        i++;
        continue;
      }
  
      // Empty lines
      if (line === "") {
        i++;
        continue;
      }
  
      const chordLine = lines[i];
      const nextLyricLine = lines[i + 1] && !/^\[.+\]$/.test(lines[i + 1].trim()) ? lines[i + 1] : undefined;
  
      // If chord line with no lyric line below
      if (nextLyricLine === undefined) {
        // Tabs: treat as chord progression
        if (chordLine.includes("\t")) {
          // Each tab-separated chord gets its own slot
          const chords = chordLine.split("\t").map(c => c.trim()).filter(Boolean);
          result.push({
            slots: chords.map(ch => ({ chord: ch, word: "" })),
          });
        } else if (chordLine.match(/ {2,}/)) {
          // Multiple spaces: treat as progression, split by runs of spaces
          const chords = chordLine.split(/ {2,}/).map(c => c.trim()).filter(Boolean);
          result.push({
            slots: chords.map(ch => ({ chord: ch, word: "" })),
          });
        } else if (chordLine.match(/ /)) {
          // Single spaces: treat as quick change, one slot with all chords
          result.push({
            slots: [{ chord: chordLine.trim(), word: "" }],
          });
        } else {
          // Single chord, no spaces
          result.push({
            slots: [{ chord: chordLine.trim(), word: "" }],
          });
        }
        i += 1;
        continue;
      }
  
      // Parse chords for normal paired lines
      const chords = [];
      let regex = /([A-G][#b]?[^ \t]*)/g;
      let match;
      while ((match = regex.exec(chordLine)) !== null) {
        chords.push({ chord: match[0].trim(), index: match.index });
      }
  
      // Parse words and their indices
      const wordRegex = /\S+/g;
      const words = [];
      while ((match = wordRegex.exec(nextLyricLine)) !== null) {
        words.push({ word: match[0], index: match.index });
      }
  
      // Build slots: Each slot has a chord and a word (or empty)
      const slots = [];
      let wordIdx = 0;
      for (let c = 0; c < chords.length; c++) {
        while (
          wordIdx < words.length &&
          words[wordIdx].index < chords[c].index
        ) {
          slots.push({ chord: "", word: words[wordIdx].word });
          wordIdx++;
        }
        if (
          wordIdx < words.length &&
          words[wordIdx].index === chords[c].index
        ) {
          slots.push({ chord: chords[c].chord, word: words[wordIdx].word });
          wordIdx++;
        } else {
          slots.push({ chord: chords[c].chord, word: "" });
        }
      }
      while (wordIdx < words.length) {
        slots.push({ chord: "", word: words[wordIdx].word });
        wordIdx++;
      }
  
      result.push({ slots });
      i += 2;
    }
    return result;
  }