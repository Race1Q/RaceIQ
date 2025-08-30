// frontend/src/pages/Drivers/Drivers.tsx

import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast } from '@chakra-ui/react';
import styles from './Drivers.module.css';
import { FaAngleDown } from 'react-icons/fa';
import HeroSection from '../../components/HeroSection/HeroSection';
import DriverProfileCard from '../../components/DriverProfileCard/DriverProfileCard';
import LegacyDriverCard from '../../components/LegacyDriverCard/LegacyDriverCard';
import HybridDriverCard from '../../components/HybridDriverCard/HybridDriverCard';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { teamColors } from '../../lib/teamColors'; // Import the new team colors
import { driverHeadshots } from '../../lib/driverHeadshots'; // Import the driver headshots

interface Driver {
    id: number;
    full_name: string;
    driver_number: number | null;
    country_code: string | null;
    team_name: string; 
    headshot_url: string;
    team_color: string;
}

interface ApiDriver {
    id: number;
    full_name: string;
    driver_number: number | null;
    country_code: string | null;
}

const Drivers = () => {
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  const authedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const token = await getAccessTokenSilently({
      authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE, scope: "read:drivers" },
    });
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${apiBaseUrl}${url}`, { ...options, headers });
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        const activeDrivers: ApiDriver[] = await authedFetch('/api/drivers/active');

        // Map the API data and inject the static data
        const hydratedDrivers = activeDrivers.map(driver => {
          const teamName = "TBA"; // This remains a placeholder for now
          return {
            ...driver,
            team_name: teamName,
            headshot_url: driverHeadshots[driver.full_name] || "", // Get headshot from our static object
            team_color: teamColors[teamName] || teamColors["Default"], // Get team color from our static object
          };
        });
        
        setDrivers(hydratedDrivers);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        toast({
          title: 'Error fetching drivers',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [authedFetch, toast]);

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver.team_name && driver.team_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTeam = selectedTeam === "all" || driver.team_name === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  const uniqueTeams = Array.from(new Set(drivers.map(driver => driver.team_name).filter(Boolean)))
    .sort();

  return (
    <>
      <HeroSection
        title="Driver Profiles"
        subtitle="Explore the stats, history, and performance of every driver on the grid."
        backgroundImageUrl="https://images.pexels.com/photos/15155732/pexels-photo-15155732.jpeg"
      />
      <div className={styles.driversContainer}>
        <div className={styles.searchFilterContainer}>
          <div className={styles.teamFilterContainer}>
            <select
              className={styles.teamFilter}
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              disabled={loading}
            >
              <option value="all">All Teams</option>
              {uniqueTeams.map(team => (
                <option key={team} value={team!}>{team}</option>
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
        </div>
        
        {loading && <F1LoadingSpinner text="Loading Drivers..." />}
        {error && <div className={styles.noDrivers}>{error}</div>}
        
        {!loading && !error && (
          <div className={styles.driverCards}>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => {
                const driverCardData = {
                  id: driver.full_name.toLowerCase().replace(/ /g, '_'),
                  name: driver.full_name,
                  number: driver.driver_number ? String(driver.driver_number) : 'N/A',
                  team: driver.team_name,
                  nationality: driver.country_code || 'N/A',
                  image: driver.headshot_url,
                  team_color: driver.team_color,
                };

                // Conditionally render one of the THREE card styles
                if (driver.full_name === "Alexander Albon") {
                  return <LegacyDriverCard key={driver.id} driver={driverCardData} />;
                } else if (driver.full_name === "Fernando Alonso") {
                  return <HybridDriverCard key={driver.id} driver={driverCardData} />;
                } else {
                  return <DriverProfileCard key={driver.id} driver={driverCardData} />;
                }
              })
            ) : (
              <div className={styles.noDrivers}>No driver matches your search</div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Drivers;