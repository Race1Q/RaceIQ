import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import { f1ApiService } from './services/f1Api';
import type { Race } from './services/f1Api';
import './App.css';
import DbTest from './components/DbTest';
import AboutUs from './pages/AboutUs';
import Drivers from './pages/Drivers';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute'; // <-- add this
import bannerImage from './assets/2026-Concept.png';

function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [recentRaces, setRecentRaces] = useState<Race[]>([]);

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
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container" style={{ backgroundImage: `url(${bannerImage})` }}>
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
            </div>
          ) : (
            <div className="public-data">
              <h2>Recent Races</h2>

              {/* Supabase DB connectivity check */}


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
    </>
  );
}

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>RaceIQ</h2>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>

            {/* <Link to="/drivers" className="nav-link">Drivers</Link> */}
            <Link to="/driversTest" className="nav-link">Drivers</Link>
            {/* <Link to="/admin" className="nav-link">Admin</Link> */}
            <Link to="/about" className="nav-link">About</Link>
            {/* <Link to="#api" className="nav-link">API</Link> */}
            {isAuthenticated ? <LogoutButton /> : <LoginButton />}
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/driversTest" element={<Drivers />} />

        {/* MEMBER or ADMIN */}
        <Route
          path="/drivers"
          element={
            <ProtectedRoute requirePermissions={['read:drivers']}>
              <Drivers />
            </ProtectedRoute>
          }
        />

        {/* ADMIN only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requirePermissions={['admin:all']}>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>

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
