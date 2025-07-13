import React, { useRef, useState, useEffect } from "react";
import { transposeChord, getCapoChordShape } from "../utils/chordRegistry";

// Helper to split slots into chunks that fit maxChars, keeping Chord/Lyric on separate lines
function wrapChordLyricLines(slots, transpose, capo, key, maxChars) {
  let chunks = [];
  let chordLine = "";
  let lyricLine = "";
  let charCount = 0;

  slots.forEach(({ chord, word }, i) => {
    let transposedChord = transposeChord(chord, transpose, false, key);
    let capoedChord = chord ? getCapoChordShape(transposedChord, capo, false, key) : "";
    let lyricStr = word || "";
    let leadingSpace = i > 0 ? " " : "";

    // Pad chord to align with lyric
    let chordPad = "";
    if (lyricStr.length > capoedChord.length) {
      chordPad = " ".repeat(lyricStr.length - capoedChord.length);
    }
    let chordChunk = leadingSpace + capoedChord + chordPad;
    let lyricChunk = leadingSpace + lyricStr;

    // If adding this would exceed maxChars, start a new chunk
    if (charCount + chordChunk.length > maxChars && chordLine.length > 0) {
      chunks.push({ chordLine, lyricLine });
      chordLine = chordChunk.trimStart();
      lyricLine = lyricChunk.trimStart();
      charCount = chordChunk.length;
    } else {
      chordLine += chordChunk;
      lyricLine += lyricChunk;
      charCount += chordChunk.length;
    }
  });

  if (chordLine.length > 0) {
    chunks.push({ chordLine, lyricLine });
  }
  return chunks;
}

// Dynamically calculate maxChars based on container width and font size
function useDynamicMaxChars(fontSize, rootRef) {
  const [maxChars, setMaxChars] = useState(40);

  useEffect(() => {
    function calc() {
      let container = rootRef.current;
      const widthPx =
        container?.offsetWidth ||
        Math.min(window.innerWidth, 650);
      let charWidthPx = 0.58 * fontSize * 16;
      let chars = Math.max(10, Math.floor(widthPx / charWidthPx));
      setMaxChars(chars);
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [fontSize, rootRef]);

  return maxChars;
}

export default function SongViewer({
  song,
  artist,
  composers,
  key,
  capo: initialCapo // default capo from backend, optional
}) {
  const [transpose, setTranspose] = useState(0);
  const [capo, setCapo] = useState(initialCapo ?? 0);
  const [fontSize, setFontSize] = useState(1.05); // em

  const rootRef = useRef(null);
  const maxChars = useDynamicMaxChars(fontSize, rootRef);

  return (
    <div>
      {/* Song Metadata */}
      <div style={{
        marginBottom: 24,
        padding: '4px 0 8px 0',
        borderBottom: '1px solid #eee',
        fontFamily: "'Inter', Arial, sans-serif",
        fontSize: '1.02em',
        color: '#444'
      }}>
        {artist && <div><strong>Artist:</strong> {artist}</div>}
        {composers && composers.length > 0 && (
          <div>
            <strong>Composer{composers.length > 1 ? "s" : ""}:</strong> {composers.join(", ")}
          </div>
        )}
        {key && <div><strong>Key:</strong> {key}</div>}
      </div>
      {/* Transpose, Capo & Font Size Controls */}
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <div>
          <label>Transpose: {transpose}</label>
          <input
            type="range"
            min={-6}
            max={6}
            value={transpose}
            onChange={e => setTranspose(Number(e.target.value))}
            style={{ verticalAlign: "middle", margin: "0 8px" }}
          />
        </div>
        <div>
          <label>Capo: {capo}</label>
          <input
            type="range"
            min={0}
            max={8}
            value={capo}
            onChange={e => setCapo(Number(e.target.value))}
            style={{ verticalAlign: "middle", margin: "0 8px" }}
          />
        </div>
        <div>
          <label>Font Size: </label>
          <button onClick={() => setFontSize(x => Math.max(0.7, x - 0.1))} style={{margin: '0 4px'}}>A-</button>
          <span style={{display: 'inline-block', width: 32, textAlign: 'center'}}>{Math.round(fontSize * 100)}%</span>
          <button onClick={() => setFontSize(x => Math.min(2.4, x + 0.1))} style={{margin: '0 4px'}}>A+</button>
        </div>
      </div>
      {/* Song Rendering */}
      <div className="song-root" ref={rootRef}>
        {song.map((line, i) => {
          if (line.section) {
            return (
              <div
                key={`section-${i}`}
                className="song-section-heading"
                style={{
                  fontSize: `${fontSize * 1.1}em`
                }}
              >
                [{line.section}]
              </div>
            );
          }
          if (line.slots) {
            const hasWords = line.slots.some(({ word }) => word && word.trim());
            const chunks = wrapChordLyricLines(line.slots, transpose, capo, key, maxChars);
            return (
              <div key={i} className="song-line">
                {chunks.map((chunk, ci) => (
                  <React.Fragment key={ci}>
                    <pre
                      className="song-chord-line"
                      style={{
                        margin: 0,
                        fontSize: `${fontSize}em`,
                        fontFamily: "'Courier New', monospace",
                        overflowX: "initial"
                      }}
                    >{chunk.chordLine}</pre>
                    {hasWords && (
                      <pre
                        className="song-lyric-line"
                        style={{
                          margin: 0,
                          fontSize: `${fontSize}em`,
                          fontFamily: "'Courier New', monospace",
                          overflowX: "initial"
                        }}
                      >{chunk.lyricLine}</pre>
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
      {/* Responsive styles */}
      <style>{`
        .song-root {
          max-width: 650px;
          margin: 0 auto;
        }
        @media (max-width: 700px) {
          .song-root {
            max-width: 90vw;
          }
        }
        @media (max-width: 450px) {
          .song-root {
            max-width: 100vw !important;
            min-width: unset;
            padding-left: 0;
            padding-right: 0;
          }
        }
        .song-section-heading {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: bold;
          letter-spacing: 0.05em;
          color: #2d2d2d;
          font-family: 'Courier New', Courier, monospace;
        }
        .song-line {
          margin-bottom: 0.5em;
        }
        .song-chord-line,
        .song-lyric-line {
          line-height: 1.5em;
          overflow-x: initial;
          white-space: pre;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}