// frontend/src/pages/Drivers/Drivers.tsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast } from '@chakra-ui/react';
import styles from './Drivers.module.css';
import { FaAngleDown } from 'react-icons/fa'; // Import the icon
import HeroSection from '../../components/HeroSection/HeroSection';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import DriverProfileCard from '../../components/DriverProfileCard/DriverProfileCard';
import { teamColors } from '../../lib/teamColors';
import { driverHeadshots } from '../../lib/driverHeadshots';

// Interfaces
interface ApiDriver {
    id: number; full_name: string; driver_number: number | null;
    country_code: string | null; team_name: string;
}
interface Driver extends ApiDriver {
    headshot_url: string; team_color: string;
}
type GroupedDrivers = { [teamName: string]: Driver[] };

const Drivers = () => {
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. RE-INTRODUCE state for the team filter
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  const authedFetch = useCallback(async (url: string) => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE, scope: "read:drivers" },
      });
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${token}`);
      const response = await fetch(`${apiBaseUrl}${url}`, { headers });
      if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorBody}`);
      }
      return response.json();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const fetchAndProcessDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiDrivers: ApiDriver[] = await authedFetch('/api/drivers/by-standings/2025');
        const hydratedDrivers = apiDrivers.map(driver => ({
          ...driver,
          headshot_url: driverHeadshots[driver.full_name] || "",
          team_color: teamColors[driver.team_name] || teamColors["Default"],
        }));
        setDrivers(hydratedDrivers);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        toast({
          title: 'Error fetching drivers', description: err.message,
          status: 'error', duration: 5000, isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessDrivers();
  }, [authedFetch, toast]);

  // 2. UPDATE useMemo to include the team filter logic
  const { orderedTeamNames, groupedDrivers } = useMemo(() => {
    const filteredByTeam = drivers.filter((driver) => {
        return selectedTeam === "all" || driver.team_name === selectedTeam;
    });

    const groups = filteredByTeam.reduce<GroupedDrivers>((acc, driver) => {
      const team = driver.team_name;
      if (!acc[team]) acc[team] = [];
      acc[team].push(driver);
      return acc;
    }, {});
    
    const orderedTeams = [...new Set(filteredByTeam.map(d => d.team_name))];

    return { orderedTeamNames: orderedTeams, groupedDrivers: groups };
  }, [drivers, selectedTeam]);

  // Create a unique list of all teams for the dropdown menu
  const uniqueTeams = useMemo(() => [...new Set(drivers.map(d => d.team_name))].sort(), [drivers]);

  return (
    <>
      <HeroSection
        title="Driver Profiles"
        subtitle="Explore the stats, history, and performance of every driver on the grid."
        backgroundImageUrl="https://images.pexels.com/photos/15155732/pexels-photo-15155732.jpeg"
      />
      <div className={styles.driversContainer}>
        
        {/* 3. ADD the filter UI back to the page */}
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
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            <span className={styles.dropdownIcon}><FaAngleDown /></span>
          </div>
        </div>

        {loading && <F1LoadingSpinner text="Loading Drivers..." />}
        {error && <div className={styles.errorState}>{error}</div>}
        
        {!loading && !error && (
          <div className={styles.teamsContainer}>
            {orderedTeamNames.map(teamName => {
              const driversInTeam = groupedDrivers[teamName];
              if (!driversInTeam || driversInTeam.length === 0) return null;

              return (
                <div key={teamName} className={styles.teamRow}>
                  <h2 className={styles.teamNameHeader}>{teamName}</h2>
                  <div className={styles.driverRow}>
                    {driversInTeam.map(driver => {
                      const driverCardData = {
                        id: driver.full_name.toLowerCase().replace(/ /g, '_'),
                        name: driver.full_name,
                        number: driver.driver_number ? String(driver.driver_number) : 'N/A',
                        team: driver.team_name,
                        nationality: driver.country_code || 'N/A',
                        image: driver.headshot_url,
                        team_color: driver.team_color,
                      };
                      return <DriverProfileCard key={driver.id} driver={driverCardData} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Drivers;