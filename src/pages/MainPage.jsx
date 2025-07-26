import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainPage() {
  const { user } = useAuth();
  const [recentSetlists, setRecentSetlists] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentContent();
  }, []);

  const fetchRecentContent = async () => {
    try {
      // Fetch recent songs (public)
      const songsResponse = await fetch('http://localhost:8080/api/songs');
      if (songsResponse.ok) {
        const songsData = await songsResponse.json();
        setRecentSongs(songsData.slice(0, 5)); // Show latest 5 songs
      }

      // Fetch recent setlists (public)
      const setlistsResponse = await fetch('http://localhost:8080/api/setlists');
      if (setlistsResponse.ok) {
        const setlistsData = await setlistsResponse.json();
        setRecentSetlists(setlistsData.slice(0, 5)); // Show latest 5 setlists
      }
    } catch (error) {
      console.error('Error fetching recent content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Welcome Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
          Welcome to Worship Ministry
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '2rem' }}>
          Your platform for managing worship songs and setlists
        </p>
        
        {/* Main Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/search-songs"
            style={{
              background: '#3498db',
              color: 'white',
              padding: '1rem 2rem',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            🎵 Browse Songs
          </Link>
          
          {user ? (
            <>
              <Link
                to="/create-song"
                style={{
                  background: '#2ecc71',
                  color: 'white',
                  padding: '1rem 2rem',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem'
                }}
              >
                ➕ Add New Song
              </Link>
              <Link
                to="/create-setlist"
                style={{
                  background: '#9b59b6',
                  color: 'white',
                  padding: '1rem 2rem',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem'
                }}
              >
                📋 Create Setlist
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  background: '#2ecc71',
                  color: 'white',
                  padding: '1rem 2rem',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem'
                }}
              >
                Login to Add Songs
              </Link>
              <Link
                to="/register"
                style={{
                  background: '#e67e22',
                  color: 'white',
                  padding: '1rem 2rem',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem'
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Recent Songs */}
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Recent Songs</h3>
          {loading ? (
            <p>Loading songs...</p>
          ) : recentSongs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentSongs.map(song => (
                <Link
                  key={song.id}
                  to={`/song/${song.id}`}
                  style={{
                    textDecoration: 'none',
                    color: '#2c3e50',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e3f2fd';
                    e.target.style.borderColor = '#3498db';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#e9ecef';
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{song.title}</div>
                  <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
                    {song.artist} {song.key && `• ${song.key}`}
                  </div>
                </Link>
              ))}
              <Link
                to="/search-songs"
                style={{
                  textAlign: 'center',
                  color: '#3498db',
                  textDecoration: 'none',
                  padding: '0.5rem',
                  fontWeight: 'bold'
                }}
              >
                View All Songs →
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6c757d' }}>
              <p>No songs available yet.</p>
              {user && (
                <Link to="/create-song" style={{ color: '#3498db', textDecoration: 'none' }}>
                  Add the first song →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Recent Setlists */}
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Recent Setlists</h3>
          {loading ? (
            <p>Loading setlists...</p>
          ) : recentSetlists.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentSetlists.map(setlist => (
                <Link
                  key={setlist.id}
                  to={`/setlist/${setlist.id}`}
                  style={{
                    textDecoration: 'none',
                    color: '#2c3e50',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f3e5f5';
                    e.target.style.borderColor = '#9b59b6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#e9ecef';
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{setlist.title}</div>
                  <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
                    {setlist.date} • {setlist.songs?.length || 0} songs
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6c757d' }}>
              <p>No setlists available yet.</p>
              {user && (
                <Link to="/create-setlist" style={{ color: '#9b59b6', textDecoration: 'none' }}>
                  Create the first setlist →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Guest User Call to Action */}
      {!user && (
        <div style={{
          marginTop: '3rem',
          textAlign: 'center',
          padding: '2rem',
          background: '#e8f5e8',
          borderRadius: '8px',
          border: '1px solid #c3e6c3'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Want to contribute?</h3>
          <p style={{ color: '#555', marginBottom: '1.5rem' }}>
            Register to add your own songs and create setlists for your worship services.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link
              to="/register"
              style={{
                background: '#2ecc71',
                color: 'white',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                borderRadius: '5px'
              }}
            >
              Register Now
            </Link>
            <Link
              to="/login"
              style={{
                background: 'transparent',
                color: '#2ecc71',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                border: '2px solid #2ecc71',
                borderRadius: '5px'
              }}
            >
              Already have an account?
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}