import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      background: '#2c3e50',
      padding: '1rem',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Worship Ministry
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Public links - always visible */}
          <Link to="/search-songs" style={{ color: 'white', textDecoration: 'none' }}>
            Browse Songs
          </Link>
          
          {user ? (
            // Authenticated user links
            <>
              <Link to="/create-setlist" style={{ color: 'white', textDecoration: 'none' }}>
                Create Setlist
              </Link>
              <Link to="/create-song" style={{ color: 'white', textDecoration: 'none' }}>
                Add Song
              </Link>
              <span style={{ color: '#bdc3c7' }}>
                Welcome, {user.firstName || user.username}!
              </span>
              <button
                onClick={logout}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            // Guest user links
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                Login
              </Link>
              <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}