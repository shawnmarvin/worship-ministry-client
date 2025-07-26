import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import MainPage from './pages/MainPage';
import SetlistView from './pages/SetlistView';
import CreateSetlist from './pages/CreateSetlist';
import SongSearch from './pages/SongSearch';
import SongView from './pages/SongView'; // Add this import
import CreateSong from './pages/CreateSong';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div style={{ padding: '20px' }}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/setlist/:id" element={<SetlistView />} />
              <Route path="/song/:id" element={<SongView />} /> {/* Add this route */}
              <Route path="/create-setlist" element={
                <ProtectedRoute>
                  <CreateSetlist />
                </ProtectedRoute>
              } />
              <Route path="/search-songs" element={<SongSearch />} />
              <Route path="/create-song" element={
                <ProtectedRoute>
                  <CreateSong />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;