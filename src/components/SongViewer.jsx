import React, { useState } from "react";
import { transposeChord, getCapoChordShape } from "../utils/chordRegistry";

export default function SongViewer({
  rawText,
  artist,
  composers,
  songKey,
  capo: initialCapo,
  title
}) {
  const [transpose, setTranspose] = useState(0);
  const [capo, setCapo] = useState(initialCapo ?? 0);
  const [fontSize, setFontSize] = useState(16);

  // Function to transpose and apply capo to a chord
  const processChord = (chord) => {
    if (!chord) return chord;
    let transposedChord = transposeChord(chord, transpose, false, songKey);
    return getCapoChordShape(transposedChord, capo, false, songKey);
  };

  // Parse ChordPro format
  const parseChordPro = (text) => {
    const lines = text.split('\n');
    const result = [];
    let metadata = {};

    lines.forEach((line) => {
      // Handle metadata tags {title: Song Name}
      const metaMatch = line.match(/^\{([^:]+):\s*(.+)\}$/);
      if (metaMatch) {
        metadata[metaMatch[1]] = metaMatch[2];
        return;
      }

      // Handle section headers [Verse 1]
      if (line.trim().match(/^\[([^\]]+)\]$/) && !line.includes(':')) {
        result.push({
          type: 'section',
          content: line.trim().replace(/[\[\]]/g, '')
        });
        return;
      }

      // Handle chord/lyric lines
      if (line.includes('[') && line.includes(']')) {
        const slots = parseChordProLine(line);
        result.push({
          type: 'chordlyric',
          slots: slots
        });
      } else if (line.trim()) {
        // Regular lyric line
        result.push({
          type: 'lyric',
          content: line
        });
      } else {
        // Empty line
        result.push({
          type: 'empty'
        });
      }
    });

    return { metadata, content: result };
  };

  // Parse a single ChordPro line like "[C]Amazing [F]grace"
  const parseChordProLine = (line) => {
    const slots = [];
    let currentPos = 0;
    
    // Find all chord patterns [chord]
    const chordPattern = /\[([^\]]*)\]/g;
    let match;
    
    while ((match = chordPattern.exec(line)) !== null) {
      // Add any text before this chord
      const textBefore = line.substring(currentPos, match.index);
      
      // Extract the chord
      const chord = match[1];
      
      // Find the next chord or end of line
      const nextChordMatch = chordPattern.exec(line);
      let textAfter = '';
      
      if (nextChordMatch) {
        // Reset position for next iteration
        chordPattern.lastIndex = nextChordMatch.index;
        textAfter = line.substring(match.index + match[0].length, nextChordMatch.index);
      } else {
        // This is the last chord, get remaining text
        textAfter = line.substring(match.index + match[0].length);
      }
      
      slots.push({
        chord: chord,
        textBefore: textBefore,
        textAfter: textAfter
      });
      
      currentPos = match.index + match[0].length + textAfter.length;
    }
    
    // If no chords found, treat as plain text
    if (slots.length === 0) {
      slots.push({
        chord: '',
        textBefore: '',
        textAfter: line
      });
    }
    
    return slots;
  };

  // Render ChordPro content with proper alignment
  const renderChordPro = (parsedData) => {
    return parsedData.content.map((item, index) => {
      switch (item.type) {
        case 'section':
          return (
            <div
              key={index}
              style={{
                fontSize: `${fontSize + 2}px`,
                fontFamily: "'Courier New', Courier, monospace",
                fontWeight: 'bold',
                margin: '1.5em 0 0.5em 0',
                color: '#2d2d2d',
                letterSpacing: '0.05em'
              }}
            >
              [{item.content}]
            </div>
          );
          
        case 'chordlyric':
          return (
            <div key={index} style={{ 
              marginBottom: '1em',
              position: 'relative'
            }}>
              {item.slots.map((slot, slotIndex) => (
                <span key={slotIndex} style={{ 
                  display: 'inline-block',
                  position: 'relative',
                  verticalAlign: 'top'
                }}>
                  {/* Text before chord */}
                  {slot.textBefore && (
                    <span style={{
                      fontSize: `${fontSize}px`,
                      fontFamily: "'Courier New', Courier, monospace",
                      color: '#333',
                      whiteSpace: 'pre'
                    }}>
                      {slot.textBefore}
                    </span>
                  )}
                  
                  {/* Chord and text after it */}
                  <span style={{
                    display: 'inline-block',
                    position: 'relative',
                    verticalAlign: 'top'
                  }}>
                    {/* Chord line */}
                    {slot.chord && (
                      <div style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: "'Courier New', Courier, monospace",
                        color: '#2d7d32',
                        fontWeight: 'bold',
                        lineHeight: '1.2',
                        minHeight: `${fontSize * 1.2}px`,
                        whiteSpace: 'pre'
                      }}>
                        {processChord(slot.chord)}
                      </div>
                    )}
                    
                    {/* Text after chord */}
                    <div style={{
                      fontSize: `${fontSize}px`,
                      fontFamily: "'Courier New', Courier, monospace",
                      color: '#333',
                      lineHeight: '1.2',
                      whiteSpace: 'pre',
                      marginTop: slot.chord ? `-${fontSize * 1.2}px` : '0'
                    }}>
                      {slot.textAfter}
                    </div>
                  </span>
                </span>
              ))}
            </div>
          );
          
        case 'lyric':
          return (
            <div
              key={index}
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: "'Courier New', Courier, monospace",
                lineHeight: '1.4',
                color: '#333',
                marginBottom: '0.5em',
                whiteSpace: 'pre-wrap'
              }}
            >
              {item.content}
            </div>
          );
          
        case 'empty':
          return <div key={index} style={{ height: '0.5em' }} />;
          
        default:
          return null;
      }
    });
  };

  const parsedData = parseChordPro(rawText || '');

  return (
    <div>
      {/* Song Metadata */}
      <div style={{
        marginBottom: 24,
        padding: '8px 0 12px 0',
        borderBottom: '1px solid #eee',
        fontFamily: "'Inter', Arial, sans-serif",
        fontSize: '1.02em',
        color: '#444'
      }}>
        {title && <h2 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{title}</h2>}
        {artist && <div><strong>Artist:</strong> {artist}</div>}
        {composers && composers.length > 0 && (
          <div>
            <strong>Composer{composers.length > 1 ? "s" : ""}:</strong> {composers.join(", ")}
          </div>
        )}
        {songKey && <div><strong>Key:</strong> {songKey}</div>}
        <div style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#2d7d32' }}>
          <strong>Format:</strong> ChordPro
        </div>
      </div>
      
      {/* Transpose, Capo & Font Size Controls */}
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 16, 
        alignItems: 'center',
        fontFamily: "'Inter', Arial, sans-serif"
      }}>
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
          <button 
            onClick={() => setFontSize(x => Math.max(12, x - 1))} 
            style={{margin: '0 4px', padding: '4px 8px'}}
          >
            A-
          </button>
          <span style={{display: 'inline-block', width: 40, textAlign: 'center'}}>
            {fontSize}px
          </span>
          <button 
            onClick={() => setFontSize(x => Math.min(24, x + 1))} 
            style={{margin: '0 4px', padding: '4px 8px'}}
          >
            A+
          </button>
        </div>
      </div>
      
      {/* Song Content */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '1.5rem',
        background: '#fafafa',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'auto'
      }}>
        {rawText ? renderChordPro(parsedData) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#666',
            fontFamily: "'Inter', Arial, sans-serif"
          }}>
            No chord/lyric content available for this song.
          </div>
        )}
      </div>
    </div>
  );
}