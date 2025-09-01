// frontend/src/pages/Drivers/Drivers.tsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import styles from './Drivers.module.css';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import DriverProfileCard from '../../components/DriverProfileCard/DriverProfileCard';
import TeamBanner from '../../components/TeamBanner/TeamBanner';
import { teamColors } from '../../lib/teamColors';
import { driverHeadshots } from '../../lib/driverHeadshots';
import { teamLogoMap } from '../../lib/teamAssets';
import { buildApiUrl } from '../../lib/api';

// Interfaces
interface ApiDriver { id: number; full_name: string; driver_number: number | null; country_code: string | null; team_name: string; }
interface Driver extends ApiDriver { headshot_url: string; team_color: string; }
type GroupedDrivers = { [teamName: string]: Driver[] };

const Drivers = () => {
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. RE-INTRODUCE state for the selected team filter
  const [selectedTeam, setSelectedTeam] = useState<string>("All");

  const authedFetch = useCallback(async (url: string) => {
      const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE, scope: "read:drivers" },
      });
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${token}`);
      const response = await fetch(url, { headers });
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
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
        toast({
          title: 'Error fetching drivers', description: errorMessage,
          status: 'error', duration: 5000, isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessDrivers();
  }, [authedFetch, toast]);

  const { orderedTeamNames, groupedDrivers } = useMemo(() => {
    const groups = drivers.reduce<GroupedDrivers>((acc, driver) => {
      const team = driver.team_name;
      if (!acc[team]) acc[team] = [];
      acc[team].push(driver);
      return acc;
    }, {});
    const orderedTeams = [...new Set(drivers.map(d => d.team_name))];
    return { orderedTeamNames: orderedTeams, groupedDrivers: groups };
  }, [drivers]);

  // Create the list of teams to display based on the filter
  const teamsToRender = selectedTeam === 'All' ? orderedTeamNames : [selectedTeam];
  // Create the list of tabs for the UI
  const filterTabs = ["All", ...orderedTeamNames];

  return (
    <div className="pageContainer">
      {loading && <F1LoadingSpinner text="Loading Drivers..." />}
      {error && <div className={styles.errorState}>{error}</div>}
      
      {!loading && !error && (
        <>
          {/* 2. ADD the filter tabs UI at the top of the page content */}
          <div className={styles.tabsContainer}>
            {filterTabs.map(team => (
              <button
                key={team}
                className={`${styles.tab} ${selectedTeam === team ? styles.activeTab : ''}`}
                onClick={() => setSelectedTeam(team)}
              >
                {team}
              </button>
            ))}
          </div>

          <div className={styles.teamsContainer}>
            {/* 3. MAP over the filtered list of teams */}
            {teamsToRender.length > 0 ? (
                teamsToRender.map(teamName => {
                const driversInTeam = groupedDrivers[teamName];
                if (!driversInTeam || driversInTeam.length === 0) return null;

                return (
                  <div key={teamName} className={styles.teamSection}>
                    <TeamBanner 
                      teamName={teamName}
                      logoUrl={teamLogoMap[teamName] || ''}
                      teamColor={teamColors[teamName] || teamColors['Default']}
                    />
                    <div className={styles.driverRow}>
                      {driversInTeam.map(driver => {
                        // The driver object from the API must contain both a unique slug and the numeric id.
                        // For example: { id: 1, slug: 'max_verstappen', full_name: 'Max Verstappen', ... }
                        const driverSlug = driver.full_name.toLowerCase().replace(/ /g, '_');
                        
                        const driverCardData = {
                          id: driver.full_name.toLowerCase().replace(/ /g, '_'),
                          name: driver.full_name,
                          number: driver.driver_number ? String(driver.driver_number) : 'N/A',
                          team: driver.team_name,
                          nationality: driver.country_code || 'N/A',
                          image: driver.headshot_url,
                          team_color: driver.team_color,
                        };
                        
                        return (
                          // THE FIX: Add the `state` prop to the Link component.
                          <Link 
                            key={driver.id}
                            to={`/drivers/${driverSlug}`} 
                            state={{ driverId: driver.id }} // <-- THIS IS THE CRITICAL FIX
                          >
                            <DriverProfileCard driver={driverCardData} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
                <div className={styles.noDrivers}>No drivers found.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Drivers;