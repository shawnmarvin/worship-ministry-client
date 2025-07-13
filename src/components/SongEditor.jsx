import React, { useState } from "react";
import ChordPalette from "./ChordPalette";
import { parseChordProLines } from "../utils/parseChordProLines";

export default function SongEditor({ song, setSong }) {
  const [inputText, setInputText] = useState("");

  function handleParse() {
    if (!inputText.trim()) return;
    setSong(parseChordProLines(inputText));
    setInputText("");
  }

  function handleWordChord(lineIdx, wordIdx, chord) {
    const newSong = song.map((line, i) =>
      i === lineIdx
        ? {
            ...line,
            words: line.words.map((w, j) =>
              j === wordIdx ? { ...w, chord } : w
            ),
          }
        : line
    );
    setSong(newSong);
  }

  function handlePrefixChord(lineIdx, chordIdx, newChord) {
    const newSong = song.map((line, i) =>
      i === lineIdx
        ? {
            ...line,
            prefixChords: line.prefixChords.map((ch, j) =>
              j === chordIdx ? newChord : ch
            ),
          }
        : line
    );
    setSong(newSong);
  }

  function handleSuffixChord(lineIdx, chordIdx, newChord) {
    const newSong = song.map((line, i) =>
      i === lineIdx
        ? {
            ...line,
            suffixChords: line.suffixChords.map((ch, j) =>
              j === chordIdx ? newChord : ch
            ),
          }
        : line
    );
    setSong(newSong);
  }

  return (
    <div
      style={{
        background: "#faf8ff",
        padding: 18,
        borderRadius: 8,
        marginTop: 18,
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      <h3>Import Song (Chord Lines Above Lyrics)</h3>
      <textarea
        rows={8}
        style={{
          width: "100%",
          marginBottom: 8,
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 16,
          lineHeight: 1.5,
        }}
        placeholder={`     F                                  Am
Your name is the highest
     G
Your name is the greatest
     Am                     F
Your name stands above them all
    F                    Am
All thrones and dominions
    G
All powers and positions
     Am                     Dm
Your name stands above them all`}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button onClick={handleParse} disabled={!inputText.trim()}>
        Parse & Replace Song
      </button>
      <div style={{ marginTop: 16 }}>
        <b>Assign or edit chords:</b>
        {song && song.map((line, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginBottom: 4,
              fontFamily: "'Courier New', Courier, monospace",
            }}
          >
            {/* Prefix chords */}
            {line.prefixChords &&
              line.prefixChords.map((ch, idx) => (
                <div
                  key={`prefix-${idx}`}
                  style={{ textAlign: "center", minWidth: 36, marginRight: 6 }}
                >
                  <ChordPalette
                    value={ch}
                    onChange={(c) => handlePrefixChord(i, idx, c)}
                  />
                  <div style={{ fontSize: 12, color: "#888" }}>{" "}</div>
                </div>
              ))}
            {/* Words & their chords */}
            {line.words && line.words.map(({ word, chord }, j) => (
              <div
                key={j}
                style={{
                  margin: "0 6px",
                  textAlign: "center",
                  minWidth: 36,
                  fontFamily: "'Courier New', Courier, monospace",
                }}
              >
                <ChordPalette
                  value={chord}
                  onChange={(c) => handleWordChord(i, j, c)}
                />
                <div style={{ fontSize: 14 }}>{word}</div>
              </div>
            ))}
            {/* Suffix chords */}
            {line.suffixChords &&
              line.suffixChords.map((ch, idx) => (
                <div
                  key={`suffix-${idx}`}
                  style={{ textAlign: "center", minWidth: 36, marginLeft: 6 }}
                >
                  <ChordPalette
                    value={ch}
                    onChange={(c) => handleSuffixChord(i, idx, c)}
                  />
                  <div style={{ fontSize: 12, color: "#888" }}>{" "}</div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}