import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SongViewer from '../components/SongViewer';

export default function SetlistView() {
  const { id } = useParams();
  const [setlist, setSetlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    fetchSetlist();
  }, [id]);

  const fetchSetlist = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/setlists/${id}`);
      const data = await response.json();
      setSetlist(data);
      if (data.songs && data.songs.length > 0) {
        setSelectedSong(data.songs[0]);
      }
    } catch (error) {
      console.error('Error fetching setlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div>Loading setlist...</div>;
  if (!setlist) return <div>Setlist not found</div>;

  return (
    <div style={{ display: 'flex', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', flexShrink: 0 }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#3498db' }}>
          ← Back to Schedule
        </Link>
        
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <h2 style={{ margin: '0 0 1rem 0' }}>{setlist.name}</h2>
          <p><strong>Date:</strong> {formatDate(setlist.scheduledDate)}</p>
          <p><strong>Worship Leader:</strong> {setlist.worshipLeader}</p>
          {setlist.notes && <p><strong>Notes:</strong> {setlist.notes}</p>}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h3>Songs ({setlist.songs?.length || 0})</h3>
          {setlist.songs && setlist.songs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {setlist.songs.map((song, index) => (
                <button
                  key={song.id}
                  onClick={() => setSelectedSong(song)}
                  style={{
                    padding: '0.75rem',
                    border: selectedSong?.id === song.id ? '2px solid #3498db' : '1px solid #ddd',
                    borderRadius: '5px',
                    background: selectedSong?.id === song.id ? '#e3f2fd' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{index + 1}. {song.title}</div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {song.artist} {song.key && `• Key: ${song.key}`}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>No songs in this setlist</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {selectedSong ? (
          <SongViewer
            song={JSON.parse(selectedSong.text)}
            artist={selectedSong.artist}
            composers={selectedSong.composers}
            key={selectedSong.key}
            capo={selectedSong.capo}
            title={selectedSong.title}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Select a song from the sidebar to view chords and lyrics</p>
          </div>
        )}
      </div>
    </div>
  );
}