import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SongViewer from '../components/SongViewer';

export default function SongView() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSong();
  }, [id]);

  const fetchSong = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/songs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSong(data);
      } else {
        setError('Song not found');
      }
    } catch (error) {
      console.error('Error fetching song:', error);
      setError('Error loading song');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading song...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!song) return <div>Song not found</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <Link 
        to="/search-songs" 
        style={{ 
          textDecoration: 'none', 
          color: '#3498db',
          marginBottom: '1rem',
          display: 'inline-block'
        }}
      >
        ← Back to Search
      </Link>
      
      <SongViewer
        rawText={song.text}
        artist={song.artist}
        composers={song.composers}
        songKey={song.key}
        capo={song.capo}
        title={song.title}
        // No format parameter needed - everything is ChordPro now
      />
    </div>
  );
}