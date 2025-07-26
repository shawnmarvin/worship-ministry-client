import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SongSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllSongs();
  }, []);

  const fetchAllSongs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/songs');
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchSongs = async () => {
    setLoading(true);
    try {
      const url = searchQuery.trim() 
        ? `http://localhost:8080/api/songs/search?q=${encodeURIComponent(searchQuery)}`
        : 'http://localhost:8080/api/songs';
      const response = await fetch(url);
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error('Error searching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchSongs();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Search Songs</h1>
      
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or artist..."
            style={{ flex: 1, padding: '0.75rem', fontSize: '1rem' }}
          />
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
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      <div>
        <h3>Results ({songs.length})</h3>
        {songs.length === 0 ? (
          <p>No songs found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {songs.map(song => (
              <Link
                key={song.id}
                to={`/song/${song.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: '#f9f9f9',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e3f2fd';
                    e.target.style.borderColor = '#3498db';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f9f9f9';
                    e.target.style.borderColor = '#ddd';
                  }}
                >
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{song.title}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                    <strong>Artist:</strong> {song.artist}
                  </p>
                  {song.key && (
                    <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                      <strong>Key:</strong> {song.key}
                    </p>
                  )}
                  {song.composers && song.composers.length > 0 && (
                    <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                      <strong>Composers:</strong> {song.composers.join(', ')}
                    </p>
                  )}
                  {song.capo > 0 && (
                    <p style={{ margin: '0', color: '#666' }}>
                      <strong>Capo:</strong> {song.capo}
                    </p>
                  )}
                  {song.createdBy && (
                    <p style={{ margin: '0.5rem 0 0 0', color: '#888', fontSize: '0.9em' }}>
                      Created by: {song.createdBy.firstName} {song.createdBy.lastName}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}