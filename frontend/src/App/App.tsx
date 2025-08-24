import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../components/LoginButton/LoginButton';
import LogoutButton from '../components/LogoutButton/LogoutButton';
import F1LoadingSpinner from '../components/F1LoadingSpinner/F1LoadingSpinner';
import { f1ApiService } from '../services/f1Api';
import type { Race } from '../services/f1Api';
import styles from './App.module.css';
import DbTest from '../components/DbTest/DbTest';
import AboutUs from '../pages/AboutUs/AboutUs';
import Drivers from '../pages/Drivers/Drivers';
import DriversDashboardPage from '../pages/DriversDashboardPage';
import Admin from '../pages/Admin/Admin';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { useActiveRoute } from '../hooks/useActiveRoute';
import bannerImage from '../assets/2026-Concept.png';

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
    return <F1LoadingSpinner text="Loading RaceIQ" />;
  }

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer} style={{ backgroundImage: `url(${bannerImage})` }}>
          <h1 className={styles.heroTitle}>Track Every F1 Appearance</h1>
          <p className={styles.heroSubtitle}>
            View race results and appearances for your favourite drivers and teams — across sports.
          </p>
          <div className={styles.heroButtons}>
            <button className={`${styles.btn} ${styles.btnPrimary}`}>View Public Data</button>
            {!isAuthenticated && <LoginButton />}
          </div>
        </div>
      </section>

      {/* Public Data Preview / Personalized Feed */}
      <section className={styles.dataSection}>
        <div className={styles.container}>
          {isAuthenticated ? (
            <div className={styles.personalizedFeed}>
              <h2>Welcome back, {user?.name}!</h2>
              <p>Your personalized F1 feed will appear here.</p>
            </div>
          ) : (
            <div className={styles.publicData}>
              <h2>Recent Races</h2>

              {/* Supabase DB connectivity check */}


              <div className={styles.racesGrid}>
                {recentRaces.map((race: Race) => (
                  <div key={race.id} className={styles.raceCard}>
                    <h3>{race.name}</h3>
                    <p className={styles.raceDate}>{new Date(race.date).toLocaleDateString()}</p>
                    <div className={styles.raceResult}>
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
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
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
  const isHomeActive = useActiveRoute('/');
  const isDriversActive = useActiveRoute('/drivers');
  const isAboutActive = useActiveRoute('/about');
  const isAdminActive = useActiveRoute('/admin');

  return (
    <div className={styles.app}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navLogo}>
            <Link to="/" style={{ textDecoration: 'none' }} aria-label="Go to home">
              <h2>RaceIQ</h2>
            </Link>
          </div>
          <div className={styles.navLinks}>
            <Link 
              to="/" 
              className={`${styles.navLink} ${isHomeActive ? styles.navLinkActive : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/drivers" 
              className={`${styles.navLink} ${isDriversActive ? styles.navLinkActive : ''}`}
            >
              Drivers
            </Link>
            <Link 
              to="/drivers-dashboard" 
              className={`${styles.navLink} ${useActiveRoute('/drivers-dashboard') ? styles.navLinkActive : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/about" 
              className={`${styles.navLink} ${isAboutActive ? styles.navLinkActive : ''}`}
            >
              About
            </Link>
            {isAuthenticated && (
              <Link 
                to="/admin" 
                className={`${styles.navLink} ${isAdminActive ? styles.navLinkActive : ''}`}
              >
                Admin
              </Link>
            )}
            {isAuthenticated ? <LogoutButton /> : <LoginButton />}
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/drivers-dashboard" element={<DriversDashboardPage />} />

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
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLinks}>
              <a href="#api-docs" className={styles.footerLink}>API Docs</a>
              <a href="#privacy" className={styles.footerLink}>Privacy Policy</a>
              <a href="#contact" className={styles.footerLink}>Contact</a>
            </div>
            <p className={styles.footerCopyright}>
              ©2025 RaceIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
