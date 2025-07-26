import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CreateSetlist() {
  const [name, setName] = useState('');
  const [worshipLeader, setWorshipLeader] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    if (searchQuery.trim()) {
      searchSongs();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchSongs = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/songs/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching songs:', error);
    }
  };

  const addSong = (song) => {
    if (!selectedSongs.find(s => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const removeSong = (songId) => {
    setSelectedSongs(selectedSongs.filter(s => s.id !== songId));
  };

  const moveSong = (fromIndex, toIndex) => {
    const newSongs = [...selectedSongs];
    const [movedSong] = newSongs.splice(fromIndex, 1);
    newSongs.splice(toIndex, 0, movedSong);
    setSelectedSongs(newSongs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const setlistData = {
        name,
        worshipLeader,
        scheduledDate: new Date(scheduledDate).toISOString(),
        notes,
        songs: selectedSongs
      };

      const response = await fetch('http://localhost:8080/api/setlists', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(setlistData)
      });

      if (response.ok) {
        navigate('/');
      } else {
        console.error('Failed to create setlist');
      }
    } catch (error) {
      console.error('Error creating setlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Create New Setlist</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '2rem' }}>
        {/* Left Column - Form */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Setlist Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Worship Leader:</label>
            <input
              type="text"
              value={worshipLeader}
              onChange={(e) => setWorshipLeader(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Scheduled Date & Time:</label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Notes (optional):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
            />
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
              cursor: 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Setlist'}
          </button>
        </div>

        {/* Right Column - Song Selection */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Search Songs:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or artist..."
              style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{ marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
              {searchResults.map(song => (
                <div
                  key={song.id}
                  style={{
                    padding: '0.5rem',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    background: selectedSongs.find(s => s.id === song.id) ? '#e3f2fd' : 'white'
                  }}
                  onClick={() => addSong(song)}
                >
                  <div style={{ fontWeight: 'bold' }}>{song.title}</div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {song.artist} {song.key && `• Key: ${song.key}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Songs */}
          <div>
            <label>Selected Songs ({selectedSongs.length}):</label>
            <div style={{ marginTop: '0.5rem' }}>
              {selectedSongs.map((song, index) => (
                <div
                  key={song.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem',
                    margin: '0.25rem 0',
                    background: '#f8f9fa',
                    borderRadius: '5px'
                  }}
                >
                  <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>{index + 1}.</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{song.title}</div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>{song.artist}</div>
                  </div>
                  <div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveSong(index, index - 1)}
                        style={{ marginRight: '0.25rem', padding: '0.25rem' }}
                      >
                        ↑
                      </button>
                    )}
                    {index < selectedSongs.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveSong(index, index + 1)}
                        style={{ marginRight: '0.25rem', padding: '0.25rem' }}
                      >
                        ↓
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSong(song.id)}
                      style={{ padding: '0.25rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px' }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}