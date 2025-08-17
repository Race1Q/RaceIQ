import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { supabase } from "../lib/supabase";
import "./Drivers.css";
import  bannerImage  from "../assets/F1-2025-drivers-lineup.png";
import userIcon from "../assets/UserIcon.png";
import { 
    FaChevronDown,       // Simple arrow
    FaCaretDown,         // Caret
    FaAngleDown,         // Angle bracket
    FaArrowDown,         // Straight arrow
    FaSortDown           // Sort arrow
  } from 'react-icons/fa';

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
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  // Fetch drivers data
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const { data, error } = await supabase
          .from("drivers")
          .select("*")
          .order("driver_number", { ascending: true });

        if (error) throw error;
        setDrivers(data || []);
      } catch (error) {
        console.error("Error fetching drivers:", error);
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


  // Render individual driver card
  const renderDriverCard = (driver: Drivers) => {
    const cardStyle: CSSProperties = {
      color: "#000000" // always black text
    };
      const formatTeamColor = (color: string | null) => {
        return `#${color || 'FFFFFF'}`;
      };

      const teamColor = formatTeamColor(driver.team_colour);

    return (
      <div key={driver.driver_id} className="driver-card" style={cardStyle}>
      
      {/* Image with team color background */}
      <div 
        className="driver-image-wrapper" 
        style={{ backgroundColor: teamColor }}
      >
        {driver.headshot_url ? (
          <img
            src={driver.headshot_url}
            alt={driver.full_name}
            className="driver-image"
            onError={(e) => {
              e.currentTarget.src = userIcon;
              e.currentTarget.className = 'driver-image fallback-image';
            }}
          />
        ) : (
          <img
            src={userIcon}
            alt="Default driver"
            className="driver-image fallback-image"
          />
        )}
        </div>

        <div className="driver-info">
          <h2>{driver.full_name || 'Unknown Driver'}</h2>
          <p><strong>Number:</strong> {driver.driver_number || '--'}</p>
          <p><strong>Team:</strong> {driver.team_name || 'Unknown Team'}</p>
          <p><strong>Country:</strong> {driver.country_code || '--'}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
  }

  return (
    <div className="drivers-container">

    {/* Banner Section */}
    <div className="drivers-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
        <div className="banner-content">
         <h1 className="banner-title">Formula 1 Drivers</h1>
             <p className="banner-text">
                Explore the complete lineup of F1 drivers over all seasons. 
                Click on a driver to view their profile and stats.
             </p>
        </div>
    </div>

    {/* Search and Filter Container */}
<div className="search-filter-container">

    {/* Team Filter Dropdown */}
<div className="team-filter-container">
    <select
      className="team-filter"
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
    <span className="dropdown-icon"><FaAngleDown /></span>
  </div>


  {/* Search Bar (keep existing) */}
  <div className="driver-search-container">
    <span className="search-icon">🔍</span>
    <input
      type="text"
      className="driver-search"
      placeholder="Search by name or team..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{ color: '#000000' }}
    />
  </div>

  {/* New Scrollable Toggle */}
  <div className="driver-toggle">
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
      <div className="driver-cards">
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map(renderDriverCard)
        ) : (
          <div className="no-drivers">No driver matches your search</div>
        )}
      </div>
    </div>
  );
};

export default Drivers;
