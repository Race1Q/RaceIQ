import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Gauge } from 'lucide-react';
import LoginButton from '../components/LoginButton/LoginButton';
import LogoutButton from '../components/LogoutButton/LogoutButton';
import F1LoadingSpinner from '../components/F1LoadingSpinner/F1LoadingSpinner';
import ThemeToggleButton from '../components/ThemeToggleButton/ThemeToggleButton';
import { f1ApiService } from '../services/f1Api';
import type { Race } from '../services/f1Api';
import styles from './App.module.css';
import AboutUs from '../pages/AboutUs/AboutUs';
import Drivers from '../pages/Drivers/Drivers';
import DriverDetailPage from '../pages/DriverDetailPage/DriverDetailPage';
import RacesPage from '../pages/RacesPage/RacesPage';
import Admin from '../pages/Admin/Admin';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { useActiveRoute } from '../hooks/useActiveRoute';
import HeroSection from '../components/HeroSection/HeroSection';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { RoleProvider, useRole } from '../context/RoleContext';
import useScrollToTop from '../hooks/useScrollToTop';
import BackToTopButton from '../components/BackToTopButton/BackToTopButton';
import UserRegistrationHandler from '../components/UserRegistrationHandler/UserRegistrationHandler';

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
      <HeroSection
        title="Track Every F1 Appearance"
        subtitle="View race results and appearances for your favourite drivers and teams — across sports."
        backgroundImageUrl="https://images.pexels.com/photos/29252131/pexels-photo-29252131.jpeg"
      />
      
      {/* Hero Buttons */}
     

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

function Navbar() {
  const { isAuthenticated } = useAuth0();
  const { role } = useRole();
  const navigate = useNavigate();
  const isHomeActive = useActiveRoute('/');
  const isDriversActive = useActiveRoute('/drivers');
  const isRacesActive = useActiveRoute('/races');
  const isAboutActive = useActiveRoute('/about');
  const isAdminActive = useActiveRoute('/admin');
  const isProfileActive = useActiveRoute('/profile');

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navLogo}>
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="Go to home">
            <div className={styles.logoContainer}>
              <Gauge size={24} />
              <h2 className={styles.logoText}>RaceIQ</h2>
            </div>
          </Link>
        </div>
        <div className={styles.navLinks}>
          <div className={styles.navCenter}>
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
              to="/races" 
              className={`${styles.navLink} ${isRacesActive ? styles.navLinkActive : ''}`}
            >
              Races
            </Link>
            <Link 
              to="/about" 
              className={`${styles.navLink} ${isAboutActive ? styles.navLinkActive : ''}`}
            >
              About
            </Link>
            {role === 'admin' && (
              <Link 
                to="/admin" 
                className={`${styles.navLink} ${isAdminActive ? styles.navLinkActive : ''}`}
              >
                Admin
              </Link>
            )}
          </div>
          <div className={styles.navRight}>
            <ThemeToggleButton />
            {isAuthenticated ? <LogoutButton /> : <LoginButton />}
            {isAuthenticated && (
              <button 
                onClick={() => navigate('/profile')}
                className={isProfileActive ? styles.navLinkActive : ''}
              >
                My Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const { themeColor, themeRgbColor } = useTheme();
  useScrollToTop();

  return (
    <div 
      className={styles.app}
      style={{
        '--dynamic-accent-color': themeColor,
        '--dynamic-accent-rgb': themeRgbColor,
      } as React.CSSProperties}
    >
      <Navbar />
      
      {/* Routes */}
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/drivers/:driverId" element={<DriverDetailPage />} />
        <Route path="/races" element={<RacesPage />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        {/* ADMIN only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>

      <BackToTopButton />

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

function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <UserRegistrationHandler>
          <AppContent />
        </UserRegistrationHandler>
      </RoleProvider>
    </ThemeProvider>
  );
}

export default App;
