import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CreateSong() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('');
  const [capo, setCapo] = useState(0);
  const [composers, setComposers] = useState('');
  const [text, setText] = useState('');
  const [inputFormat, setInputFormat] = useState('chordpro');
  const [loading, setLoading] = useState(false);
  const [conversionError, setConversionError] = useState('');
  
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  // Convert traditional format to ChordPro
  const convertTraditionalToChordPro = (traditionalText) => {
    const lines = traditionalText.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        result.push('');
        i++;
        continue;
      }
      
      // Handle section headers [Verse 1], [Chorus], etc.
      if (line.trim().match(/^\[([^\]]+)\]$/)) {
        result.push(line.trim());
        i++;
        continue;
      }
      
      // Check if this is a chord line followed by lyrics
      const nextLine = (i + 1 < lines.length) ? lines[i + 1] : '';
      
      if (isChordLine(line) && nextLine.trim() && !isChordLine(nextLine)) {
        // Convert chord + lyric pair to ChordPro format
        const chordProLine = convertChordLyricPairToChordPro(line, nextLine);
        if (chordProLine) {
          result.push(chordProLine);
        }
        i += 2; // Skip both lines
      } else if (isChordLine(line)) {
        // Chord-only line - convert to ChordPro format
        const chordProLine = convertChordOnlyLineToChordPro(line);
        if (chordProLine) {
          result.push(chordProLine);
        }
        i++;
      } else {
        // Regular lyric line
        result.push(line);
        i++;
      }
    }
    
    return result.join('\n');
  };

  // Check if a line is primarily chords
  const isChordLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    
    const chordPattern = /\b[A-G][#b]?(?:maj|minor|min|m|sus\d?|add\d+|dim|aug|\d+|M\d+)?(?:\/[A-G][#b]?)?\b/g;
    const chordMatches = trimmed.match(chordPattern) || [];
    const wordPattern = /\b[a-z]{3,}[a-z]*\b/gi;
    const wordMatches = trimmed.match(wordPattern) || [];
    
    const chordChars = chordMatches.join('').length;
    const totalNonSpaceChars = trimmed.replace(/\s+/g, '').length;
    
    // Decision logic
    if (chordMatches.length === 0) return false;
    if (chordChars / Math.max(totalNonSpaceChars, 1) > 0.5) return true;
    if (chordMatches.length >= 2 && wordMatches.length <= 1) return true;
    if (trimmed.length < 40 && chordMatches.length >= 1 && wordMatches.length === 0) return true;
    
    return false;
  };

  // Convert chord-only line to ChordPro
  const convertChordOnlyLineToChordPro = (chordLine) => {
    const chordPattern = /\b[A-G][#b]?(?:maj|minor|min|m|sus\d?|add\d+|dim|aug|\d+|M\d+)?(?:\/[A-G][#b]?)?\b/g;
    
    return chordLine.replace(chordPattern, (match) => `[${match}]`);
  };

  // Convert chord + lyric pair to ChordPro format
  const convertChordLyricPairToChordPro = (chordLine, lyricLine) => {
    const chordPattern = /\b[A-G][#b]?(?:maj|minor|min|m|sus\d?|add\d+|dim|aug|\d+|M\d+)?(?:\/[A-G][#b]?)?\b/g;
    const chords = [];
    let match;
    
    // Extract all chords and their positions
    while ((match = chordPattern.exec(chordLine)) !== null) {
      chords.push({
        chord: match[0],
        position: match.index
      });
    }
    
    if (chords.length === 0) {
      return lyricLine; // No chords found, just return lyrics
    }
    
    // Build ChordPro line by inserting chords at appropriate positions
    let result = '';
    let lyricIndex = 0;
    
    chords.forEach((chordInfo, index) => {
      // Calculate where in the lyrics this chord should go
      let targetLyricPos = Math.min(chordInfo.position, lyricLine.length);
      
      // Add lyrics up to this chord position
      if (targetLyricPos > lyricIndex) {
        result += lyricLine.substring(lyricIndex, targetLyricPos);
        lyricIndex = targetLyricPos;
      }
      
      // Add the chord
      result += `[${chordInfo.chord}]`;
      
      // If we're not at a word boundary, find the next space or end
      while (lyricIndex < lyricLine.length && 
             lyricLine[lyricIndex] !== ' ' && 
             lyricLine[lyricIndex] !== '\t') {
        result += lyricLine[lyricIndex];
        lyricIndex++;
      }
    });
    
    // Add any remaining lyrics
    if (lyricIndex < lyricLine.length) {
      result += lyricLine.substring(lyricIndex);
    }
    
    return result;
  };

  // Validate ChordPro format (FIXED - excludes section headers)
  const validateChordPro = (text) => {
    const lines = text.split('\n');
    const errors = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // Skip empty lines
      
      // Skip metadata lines like {title: Song Name}
      if (trimmedLine.match(/^\{[^:]+:\s*.+\}$/)) {
        return;
      }
      
      // Skip section headers like [Intro], [Verse 1], [Chorus], etc.
      // Section headers are brackets with NO colon and contain common section names
      const sectionHeaderMatch = trimmedLine.match(/^\[([^\]]+)\]$/);
      if (sectionHeaderMatch) {
        const sectionContent = sectionHeaderMatch[1].toLowerCase();
        const commonSections = [
          'intro', 'verse', 'chorus', 'bridge', 'outro', 'pre-chorus', 'prechorus',
          'tag', 'coda', 'instrumental', 'solo', 'breakdown', 'refrain', 'hook',
          'verse 1', 'verse 2', 'verse 3', 'verse 4',
          'chorus 1', 'chorus 2', 'chorus 3',
          'pre-chorus 1', 'pre-chorus 2', 'prechorus 1', 'prechorus 2',
          'bridge 1', 'bridge 2',
          'outro 1', 'outro 2'
        ];
        
        // Check if it's a common section name or has a number
        const isSection = commonSections.some(section => 
          sectionContent === section || 
          sectionContent.includes(section) ||
          /^(verse|chorus|bridge|intro|outro|pre-chorus|prechorus|tag|coda)\s*\d*$/i.test(sectionContent)
        );
        
        if (isSection) {
          return; // Valid section header, skip validation
        }
        // If it's not a recognized section, it might be an invalid chord
      }
      
      // Check for unmatched brackets in chord/lyric lines
      const openBrackets = (line.match(/\[/g) || []).length;
      const closeBrackets = (line.match(/\]/g) || []).length;
      
      if (openBrackets !== closeBrackets) {
        errors.push(`Line ${index + 1}: Unmatched brackets in "${line.trim()}"`);
        return;
      }
      
      // Check for invalid chord patterns (but skip section headers)
      const chordMatches = line.match(/\[([^\]]*)\]/g) || [];
      chordMatches.forEach(match => {
        const content = match.slice(1, -1); // Remove brackets
        if (!content) return; // Empty brackets are ok
        
        // Skip if this looks like a section header that we missed
        const isLikelySection = /^(intro|verse|chorus|bridge|outro|pre-?chorus|tag|coda|instrumental|solo|breakdown|refrain|hook)(\s+\d+)?$/i.test(content);
        if (isLikelySection) return;
        
        // Validate as chord
        const chordPattern = /^[A-G][#b]?(?:maj|major|minor|min|m|sus\d?|add\d+|dim|aug|\d+|M\d+)?(?:\/[A-G][#b]?)?$/i;
        if (!chordPattern.test(content)) {
          errors.push(`Line ${index + 1}: Invalid chord "${content}" in "${line.trim()}"`);
        }
      });
    });
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setConversionError('');

    try {
      let finalText = text;
      
      // Convert traditional to ChordPro if needed
      if (inputFormat === 'traditional') {
        finalText = convertTraditionalToChordPro(text);
        console.log('Converted to ChordPro:', finalText);
      }
      
      // Validate ChordPro format
      const validationErrors = validateChordPro(finalText);
      if (validationErrors.length > 0) {
        setConversionError('ChordPro validation errors:\n' + validationErrors.join('\n'));
        setLoading(false);
        return;
      }
      
      // Save as ChordPro format
      const songData = {
        title,
        artist,
        key,
        capo: parseInt(capo),
        composers: composers.split(',').map(c => c.trim()).filter(c => c),
        text: finalText, // Always save as ChordPro
        format: 'chordpro' // Always stored as ChordPro
      };

      const response = await fetch('http://localhost:8080/api/songs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(songData)
      });

      if (response.ok) {
        navigate('/search-songs');
      } else {
        setConversionError('Failed to create song');
      }
    } catch (error) {
      console.error('Error creating song:', error);
      setConversionError('Error creating song: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const chordProExample = `{title: Holy Forever}
{artist: Bethel Music}

[Intro]
[F#] [A#m] [G#]    [C#/F] [A#m] [G#]

[Verse 1]
[C#]A thousand generations [F#]falling down in [C#]worship
[A#m]To sing the song of [G#]ages to the [F#]Lamb
[C#]And all who've gone be[F#]fore us and all who will be[C#]lieve
[A#m]Will sing the song of [G#]ages to the [F#]Lamb

[Pre-chorus]
Your [F#]name is the [A#m]highest
Your [G#]name is the greatest
Your [A#m]name stands above them [F#]all

[Chorus]
[C#]All hail the power of [F#]Jesus' name
[A#m]Let angels prostrate [G#]fall
[C#]Bring forth the royal [F#]diadem
[A#m]And crown Him [G#]Lord of [C#]all`;

  const traditionalExample = `[Intro]
 
F#  A#m G#    C#/F   A#m G#
 
 
[Verse 1]
 
  C#                   F#                C#
A thousand generations falling down in worship
   A#m              G#            F#
To sing the song of ages to the Lamb
    C#                            F#              C#
And all who've gone before us and all who will believe
     A#m               G#           F#
Will sing the song of ages to the Lamb
 
 
[Pre-chorus]
 
     F#                 A#m
Your name is the highest`;

  // Preview converted ChordPro if in traditional mode
  const showConversionPreview = inputFormat === 'traditional' && text.trim();
  const previewText = showConversionPreview ? convertTraditionalToChordPro(text) : '';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <h1>Create New Song</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Artist:</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Key:</label>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
            >
              <option value="">Select Key</option>
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Capo:</label>
            <input
              type="number"
              min="0"
              max="8"
              value={capo}
              onChange={(e) => setCapo(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Composers (comma-separated):</label>
          <input
            type="text"
            value={composers}
            onChange={(e) => setComposers(e.target.value)}
            placeholder="John Doe, Jane Smith"
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Input Format:</label>
          <div style={{ margin: '0.5rem 0' }}>
            <label style={{ marginRight: '2rem' }}>
              <input
                type="radio"
                value="chordpro"
                checked={inputFormat === 'chordpro'}
                onChange={(e) => setInputFormat(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              ChordPro Format (Recommended)
            </label>
            <label>
              <input
                type="radio"
                value="traditional"
                checked={inputFormat === 'traditional'}
                onChange={(e) => setInputFormat(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              Traditional Format (Auto-converts to ChordPro)
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Chords & Lyrics:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={inputFormat === 'chordpro' ? chordProExample : traditionalExample}
            rows={20}
            required
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              margin: '0.5rem 0', 
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '14px',
              lineHeight: '1.5',
              border: '2px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical',
              background: '#fafafa'
            }}
          />
          
          {/* Show conversion preview for traditional format */}
          {showConversionPreview && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d7d32' }}>
                ✓ ChordPro Conversion Preview:
              </h4>
              <textarea
                value={previewText}
                readOnly
                rows={10}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: '12px',
                  lineHeight: '1.4',
                  border: '2px solid #2d7d32',
                  borderRadius: '4px',
                  background: '#f0f8f0',
                  color: '#2d7d32'
                }}
              />
              <div style={{ fontSize: '0.9em', color: '#2d7d32', marginTop: '0.5rem' }}>
                This ChordPro version will be saved to the database.
              </div>
            </div>
          )}
          
          {conversionError && (
            <div style={{ 
              color: '#d32f2f', 
              background: '#ffebee', 
              padding: '1rem', 
              border: '1px solid #f8bbd9',
              borderRadius: '4px',
              marginTop: '1rem',
              whiteSpace: 'pre-line',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '0.9em'
            }}>
              {conversionError}
            </div>
          )}
          
          <div style={{ color: '#666', fontSize: '0.9em', marginTop: '0.5rem' }}>
            <strong>Format Instructions ({inputFormat === 'chordpro' ? 'ChordPro' : 'Traditional → ChordPro'}):</strong>
            {inputFormat === 'chordpro' ? (
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Put chords in square brackets: [C], [Am], [F#], [C/E]</li>
                <li>Place chords inline with lyrics: [C]Amazing [F]grace</li>
                <li>Use section headers: [Verse 1], [Chorus], [Bridge]</li>
                <li>Add metadata: {'{title: Song Name}'} and {'{artist: Artist Name}'}</li>
                <li><strong>Section headers like [Intro], [Verse 1] are automatically recognized</strong></li>
              </ul>
            ) : (
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Put section names in square brackets: [Verse 1], [Chorus], etc.</li>
                <li>Put chords on their own line above the lyrics</li>
                <li>Align chords vertically above the words using spaces</li>
                <li><strong>Will be auto-converted to ChordPro format before saving</strong></li>
                <li><strong>All songs are stored as ChordPro for consistent display</strong></li>
              </ul>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#3498db',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Creating...' : 'Create Song'}
        </button>
      </form>
    </div>
  );
}