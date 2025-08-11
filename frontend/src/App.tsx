import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import { f1ApiService } from './services/f1Api';
import type { Race } from './services/f1Api';
import './App.css';
import DbTest from './components/DbTest';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [recentRaces, setRecentRaces] = useState<Race[]>([]);

  // Fetch recent races from F1 API
  useEffect(() => {
    const fetchRecentRaces = async () => {
      const races = await f1ApiService.getRecentRaces(3);
      setRecentRaces(races);
    };
    fetchRecentRaces();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>RaceIQ</h2>
          </div>
          <div className="nav-links">
            <a href="#home" className="nav-link">Home</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#api" className="nav-link">API</a>
            {isAuthenticated ? <LogoutButton /> : <LoginButton />}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <h1 className="hero-title">Track Every F1 Appearance</h1>
          <p className="hero-subtitle">
            View race results and appearances for your favourite drivers and teams — across sports.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">View Public Data</button>
            {!isAuthenticated && <LoginButton />}
          </div>
        </div>
      </section>

      {/* Public Data Preview / Personalized Feed */}
      <section className="data-section">
        <div className="container">
          {isAuthenticated ? (
            <div className="personalized-feed">
              <h2>Welcome back, {user?.name}!</h2>
              <p>Your personalized F1 feed will appear here.</p>
              {/* TODO: Add personalized content */}
            </div>
          ) : (
            <div className="public-data">
              <h2>Recent Races</h2>

              {/* Supabase DB connectivity check */}
              <div style={{ margin: '12px 0', padding: 12, border: '1px solid #333', borderRadius: 8 }}>
                <strong>DB Test</strong>
                <DbTest />
              </div>

              <div className="races-grid">
                {recentRaces.map((race: Race) => (
                  <div key={race.id} className="race-card">
                    <h3>{race.name}</h3>
                    <p className="race-date">{new Date(race.date).toLocaleDateString()}</p>
                    <div className="race-result">
                      <p><strong>Winner:</strong> {race.winner}</p>
                      <p><strong>Team:</strong> {race.team}</p>
                      <p><strong>Circuit:</strong> {race.circuit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Create your free account and get more from every race.</h2>
              <p>Track your favorite drivers, get personalized insights, and never miss a race.</p>
              <LoginButton />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-links">
              <a href="#api-docs" className="footer-link">API Docs</a>
              <a href="#privacy" className="footer-link">Privacy Policy</a>
              <a href="#contact" className="footer-link">Contact</a>
            </div>
            <p className="footer-copyright">
              ©2025 RaceIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
