import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { supabase } from "../../lib/supabase";
import axios from 'axios';
import styles from './Drivers.module.css';
import userIcon from "../../assets/UserIcon.png";
import { FaAngleDown } from 'react-icons/fa';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import HeroSection from '../../components/HeroSection/HeroSection';

interface Drivers {
    driver_id : number;
    full_name: string;
    first_name: string;
    last_name: string;
    country_code: string;
    name_acronym: string;
    driver_number: number;
    broadcast_name: string;
    headshot_url: string;
    team_name: string;
    team_colour: string;
    season_year: number;
    isActive: boolean;
}

const Drivers = () => {
  const [drivers, setDrivers] = useState<Drivers[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // NEW state for search
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("active");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // Fetch drivers data
  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching drivers from:', `${backendUrl}/drivers`);
        
        const response = await axios.get(`${backendUrl}/drivers`);
        console.log('API Response:', response);
        console.log('Response data:', response.data);

        // SIMPLIFY THIS - response.data is already the array you need
        setDrivers(response.data); // Directly use response.data

      } catch (err) {
        console.error('Full error details:', err);
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error
          ? err.message
          : 'Failed to load drivers';
        setError(errorMessage);
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrivers();
  }, []);

  // Filter drivers based on search
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.team_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && driver.isActive) ||
      (filterActive === "inactive" && !driver.isActive);

      const matchesTeam = selectedTeam === "all" || driver.team_name === selectedTeam;

    return matchesSearch && matchesActive && matchesTeam;
});


function darkenColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken each component
  const darkenedR = Math.max(0, r * (100 - percent) / 100);
  const darkenedG = Math.max(0, g * (100 - percent) / 100);
  const darkenedB = Math.max(0, b * (100 - percent) / 100);

  // Convert back to hex
  return `#${Math.round(darkenedR).toString(16).padStart(2, '0')}${Math.round(darkenedG).toString(16).padStart(2, '0')}${Math.round(darkenedB).toString(16).padStart(2, '0')}`;
}


  // Render individual driver card
  const renderDriverCard = (driver: Drivers) => {
    const cardStyle: CSSProperties = {
      color: "#000000" // always black text
    };
      const formatTeamColor = (color: string | null) => {
        return `#${color || 'FFFFFF'}`;
      };

      const teamColor = formatTeamColor(driver.team_colour);
      const gradientStyle = {
        background: `radial-gradient(circle at center, ${teamColor} 0%, ${darkenColor(teamColor, 40)} 100%)`
      };

    return (
      <div key={driver.driver_id} className={styles.driverCard} style={cardStyle}>
      
      {/* Image with team color background */}
      <div 
        className={styles.driverImageWrapper} 
        style={gradientStyle} 
      >
        {driver.headshot_url ? (
          <img
            src={driver.headshot_url}
            alt={driver.full_name}
            className={styles.driverImage}
            onError={(e) => {
              e.currentTarget.src = userIcon;
              e.currentTarget.className = `${styles.driverImage} ${styles.fallbackImage}`;
            }}
          />
        ) : (
          <img
            src={userIcon}
            alt="Default driver"
            className={`${styles.driverImage} ${styles.fallbackImage}`}
          />
        )}

          {driver.driver_number && (
          <div className={styles.driverNumber}>
            {driver.driver_number}
          </div>
          )}
        </div>


        <h2>{driver.full_name || 'Unknown Driver'}</h2>

        <div className={styles.driverInfo}>
        <div className={styles.infoText}>
          <p><strong>Team:</strong> {driver.team_name || 'Unknown Team'}</p>
          <p><strong>Country:</strong> {driver.country_code || '--'}</p>
          </div>
          <button
            className={styles.viewProfileButton}
          >
            View Profile
          </button>
          </div>
        </div>
    );
  };

  if (loading) {
    return <F1LoadingSpinner text="Loading Drivers" />;
  }

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title="Driver Profiles"
        subtitle="Explore the stats, history, and performance of every driver on the 2025 grid."
        backgroundImageUrl="https://images.pexels.com/photos/15155732/pexels-photo-15155732.jpeg"
      />

      {/* Main Content */}
      <div className={styles.driversContainer}>
        {/* Search and Filter Container */}
        <div className={styles.searchFilterContainer}>

    {/* Team Filter Dropdown */}
<div className={styles.teamFilterContainer}>
    <select
      className={styles.teamFilter}
      value={selectedTeam}
      onChange={(e) => setSelectedTeam(e.target.value)}
    >
      <option value="all">All Teams</option>
      {Array.from(new Set(drivers.map(driver => driver.team_name)))
        .sort()
        .map(team => (
          <option key={team} value={team}>{team}</option>
        ))}
    </select>
    <span className={styles.dropdownIcon}><FaAngleDown /></span>
  </div>


  {/* Search Bar (keep existing) */}
  <div className={styles.driverSearchContainer}>
    <span className={styles.searchIcon}>🔍</span>
    <input
      type="text"
      className={styles.driverSearch}
      placeholder="Search by name or team..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{ color: '#000000' }}
    />
  </div>

  {/* New Scrollable Toggle */}
  <div className={styles.driverToggle}>
    <input
      type="radio"
      id="filter-all"
      name="filterActive"
      value="all"
      checked={filterActive === "all"}
      onChange={() => setFilterActive("all")}
    />
    <label htmlFor="filter-all">All Drivers</label>

    <input
      type="radio"
      id="filter-active"
      name="filterActive"
      value="active"
      checked={filterActive === "active"}
      onChange={() => setFilterActive("active")}
    />
    <label htmlFor="filter-active">Active</label>

    <input
      type="radio"
      id="filter-inactive"
      name="filterActive"
      value="inactive"
      checked={filterActive === "inactive"}
      onChange={() => setFilterActive("inactive")}
    />
    <label htmlFor="filter-inactive">Inactive</label>
  </div>
</div>

    {/* Driver Cards */}
      <div className={styles.driverCards}>
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map(renderDriverCard)
        ) : (
          <div className={styles.noDrivers}>No driver matches your search</div>
        )}
      </div>
      </div>
    </>
  );
};

export default Drivers;