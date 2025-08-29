import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Drivers.module.css';
import userIcon from "../../assets/UserIcon.png";
import { FaAngleDown } from 'react-icons/fa';
import HeroSection from '../../components/HeroSection/HeroSection';

interface Driver { // Renamed to singular for clarity
    driver_id: number;
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

// Dummy data to replace the database call
const dummyDrivers: Driver[] = [
    {
        driver_id: 1,
        full_name: "Max Verstappen",
        first_name: "Max",
        last_name: "Verstappen",
        country_code: "NED",
        name_acronym: "VER",
        driver_number: 1,
        broadcast_name: "M. VERSTAPPEN",
        headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col-retina/image.png",
        team_name: "Red Bull Racing",
        team_colour: "3671C6",
        season_year: 2025,
        isActive: true,
    },
    {
        driver_id: 2,
        full_name: "Lewis Hamilton",
        first_name: "Lewis",
        last_name: "Hamilton",
        country_code: "GBR",
        name_acronym: "HAM",
        driver_number: 44,
        broadcast_name: "L. HAMILTON",
        headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col-retina/image.png",
        team_name: "Mercedes",
        team_colour: "27F4D2",
        season_year: 2025,
        isActive: true,
    },
    {
        driver_id: 3,
        full_name: "Lando Norris",
        first_name: "Lando",
        last_name: "Norris",
        country_code: "GBR",
        name_acronym: "NOR",
        driver_number: 4,
        broadcast_name: "L. NORRIS",
        headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col-retina/image.png",
        team_name: "McLaren",
        team_colour: "FF8000",
        season_year: 2025,
        isActive: true,
    },
    {
        driver_id: 4,
        full_name: "Charles Leclerc",
        first_name: "Charles",
        last_name: "Leclerc",
        country_code: "MON",
        name_acronym: "LEC",
        driver_number: 16,
        broadcast_name: "C. LECLERC",
        headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col-retina/image.png",
        team_name: "Ferrari",
        team_colour: "E8002D",
        season_year: 2025,
        isActive: true,
    },
    {
        driver_id: 5,
        full_name: "Sebastian Vettel",
        first_name: "Sebastian",
        last_name: "Vettel",
        country_code: "GER",
        name_acronym: "VET",
        driver_number: 5,
        broadcast_name: "S. VETTEL",
        headshot_url: "", // Intentionally blank to test fallback
        team_name: "Aston Martin",
        team_colour: "229971",
        season_year: 2022,
        isActive: false,
    },
    {
        driver_id: 6,
        full_name: "Kimi Räikkönen",
        first_name: "Kimi",
        last_name: "Räikkönen",
        country_code: "FIN",
        name_acronym: "RAI",
        driver_number: 7,
        broadcast_name: "K. RÄIKKÖNEN",
        headshot_url: "https://example.com/invalid-url.png", // Invalid URL to test fallback
        team_name: "Alfa Romeo",
        team_colour: "C92D4B",
        season_year: 2021,
        isActive: false,
    },
];

const Drivers = () => {
  const [drivers] = useState<Driver[]>(dummyDrivers); // Initialize state with dummy data
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("active");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  // Filter drivers based on search (logic remains the same)
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
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const darkenedR = Math.max(0, r * (100 - percent) / 100);
    const darkenedG = Math.max(0, g * (100 - percent) / 100);
    const darkenedB = Math.max(0, b * (100 - percent) / 100);
    return `#${Math.round(darkenedR).toString(16).padStart(2, '0')}${Math.round(darkenedG).toString(16).padStart(2, '0')}${Math.round(darkenedB).toString(16).padStart(2, '0')}`;
  }

  // Render individual driver card (logic remains the same)
  const renderDriverCard = (driver: Driver) => {
    const driverSlug = driver.full_name.toLowerCase().replace(/ /g, '_');
    const cardStyle: CSSProperties = {
      color: "#000000"
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
        <div className={styles.driverImageWrapper} style={gradientStyle}>
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
          <Link to={`/drivers/${driverSlug}`} style={{ textDecoration: 'none' }}>
            <button className={styles.viewProfileButton}>
              View Profile
            </button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <>
      <HeroSection
        title="Driver Profiles"
        subtitle="Explore the stats, history, and performance of every driver on the 2025 grid."
        backgroundImageUrl="https://images.pexels.com/photos/15155732/pexels-photo-15155732.jpeg"
      />
      <div className={styles.driversContainer}>
        <div className={styles.searchFilterContainer}>
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