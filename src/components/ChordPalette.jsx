import React, { useState } from "react";
const BASIC_CHORDS = [
  "C", "Cm", "C#", "D", "Dm", "D#", "E", "Em", "F", "Fm", "F#", "G", "Gm", "G#", "A", "Am", "A#", "B", "Bm"
];

export default function ChordPalette({ value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ display: "inline-block", minWidth: 30, fontFamily: "'Courier New', Courier, monospace" }}>
      <span
        style={{
          border: "1px solid #ccc",
          padding: "2px 6px",
          borderRadius: 4,
          background: "#fff",
          cursor: "pointer",
          color: value ? "#5a229a" : "#aaa"
        }}
        onClick={() => setShow(s => !s)}
        title="Assign chord"
      >
        {value || "+"}
      </span>
      {show && (
        <div style={{
          position: "absolute", background: "#fff", border: "1px solid #ddd",
          zIndex: 10, padding: 6, borderRadius: 6, maxHeight: 90, overflowY: "auto"
        }}>
          {BASIC_CHORDS.map(ch => (
            <div
              key={ch}
              style={{
                padding: "2px 8px",
                cursor: "pointer",
                color: ch === value ? "#fff" : "#5a229a",
                background: ch === value ? "#5a229a" : "transparent",
                borderRadius: 4
              }}
              onClick={() => { onChange(ch); setShow(false); }}
            >{ch}</div>
          ))}
          <div
            style={{ padding: "2px 8px", color: "#d00", cursor: "pointer" }}
            onClick={() => { onChange(""); setShow(false); }}
          >Clear</div>
        </div>
      )}
    </span>
  );
}