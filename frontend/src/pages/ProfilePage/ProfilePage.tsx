import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Switch,
  Button,
  Avatar,
  FormControl,
  FormLabel,
  Divider,
  useToast,
} from '@chakra-ui/react';
import SearchableSelect from '../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import HeroSection from '../../components/HeroSection/HeroSection';
import ThemeToggleButton from '../../components/ThemeToggleButton/ThemeToggleButton';
import styles from './ProfilePage.module.css';
import { buildApiUrl } from '../../lib/api';
import { sendRaceUpdate } from '../../services/notifications';
import { useProfileUpdate } from '../../context/ProfileUpdateContext';

// SelectOption type imported from SearchableSelect component

const ProfilePage: React.FC = () => {
  // 1. Get the isLoading flag from the hook
  const { user, getAccessTokenSilently, isLoading } = useAuth0();
  const { triggerRefresh } = useProfileUpdate();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    username: user?.name || '',
    favoriteTeam: '' as number | '',
    favoriteDriver: '' as number | '',
    emailNotifications: false,
  });

  const [driverOptions, setDriverOptions] = useState<{ id: number; name: string }[]>([]);
  const [constructorOptions, setConstructorOptions] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);

  const authedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "read:drivers read:constructors read:standings", // Need both for dropdowns
      },
    });

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    if (options.body) {
      headers.set('Content-Type', 'application/json');
    }

    // Use the URL directly (Vite proxy will handle /api requests)
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorMsg = `Request failed with status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || JSON.stringify(errorData);
      } catch (e) { /* The response body was not JSON */ }
      throw new Error(errorMsg);
    }
    
    return response.json();
  }, [getAccessTokenSilently]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, constructorsData, driversData] = await Promise.all([
          authedFetch(buildApiUrl('/api/users/me')),
          authedFetch(buildApiUrl('/api/constructors')),
          authedFetch(buildApiUrl('/api/drivers'))
        ]);

        setFormData(prev => ({
          ...prev,
          username: userData.databaseUser?.username || user?.name || '',
          favoriteTeam: userData.databaseUser?.favorite_constructor_id || '',
          favoriteDriver: userData.databaseUser?.favorite_driver_id || '',
        }));
        setConstructorOptions(constructorsData);
        setDriverOptions(driversData);

      } catch (error: any) {
        console.error("CAUGHT ERROR:", error); 
        toast({
          title: 'Failed to load profile data',
          description: error.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    // 2. Wait until the user exists AND the loading is complete
    if (user && !isLoading) {
      fetchData();
    }
  // 3. Add isLoading to the dependency array
  }, [user, isLoading, authedFetch, toast]);
  
  const transformedConstructorOptions = useMemo(() =>
    constructorOptions.map(team => ({ value: team.id, label: team.name })),
    [constructorOptions]
  );

  const transformedDriverOptions = useMemo(() =>
    driverOptions.map((driver: any) => {
      const label = driver.full_name || driver.name || [driver.first_name, driver.last_name].filter(Boolean).join(' ');
      return { value: driver.id, label };
    }),
    [driverOptions]
  );

  const handleSelectChange = (field: 'favoriteDriver' | 'favoriteTeam', selectedOption: SelectOption | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: selectedOption ? selectedOption.value : '',
    }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveChanges = async () => {
    try {
      if (!user?.sub) throw new Error('No authenticated user');

      const payload = {
        username: formData.username || undefined,
        favorite_constructor_id: formData.favoriteTeam === '' ? null : Number(formData.favoriteTeam),
        favorite_driver_id: formData.favoriteDriver === '' ? null : Number(formData.favoriteDriver),
      };

      await authedFetch(buildApiUrl('/api/users/profile'), {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      // Optimistically sync local state with saved values
      setFormData(prev => ({
        ...prev,
        favoriteTeam: payload.favorite_constructor_id === null ? '' : Number(payload.favorite_constructor_id),
        favoriteDriver: payload.favorite_driver_id === null ? '' : Number(payload.favorite_driver_id),
      }));

      // Trigger refresh of dashboard widgets
      triggerRefresh();

      toast({
        title: 'Changes saved',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to save changes',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
       title: 'Account deletion',
       description: 'This feature will be implemented in a future update.',
       status: 'warning',
       duration: 5000,
       isClosable: true,
     });
  };

  const handleSendRaceInfo = async () => {
    try {
      setSending(true);
      if (!user?.email) throw new Error('No email associated with the authenticated user');

      const races = await authedFetch(buildApiUrl('/api/races'));
      const now = new Date();
      const upcoming = (races || []).filter((r: any) => {
        const date = new Date(r.date);
        return date.getFullYear() === 2025 && date >= now;
      });

      if (!upcoming.length) {
        toast({
          title: 'No upcoming 2025 races',
          description: 'There are no upcoming races remaining for 2025.',
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      const lines = upcoming.map((r: any) => {
        const date = new Date(r.date);
        const dateStr = date.toISOString().slice(0, 10);
        return `• Round ${r.round}: ${r.name} on ${dateStr}`;
      });
      const message = `Upcoming 2025 Races:\n\n${lines.join('\n')}`;

      await sendRaceUpdate({
        recipientEmail: user.email,
        raceDetails: message,
      });

      toast({
        title: 'Email sent',
        description: 'We emailed you the list of upcoming 2025 races.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send email',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSending(false);
    }
  };

  // Using standardized SearchableSelect component; styles are handled internally.

  return (
    <div className={styles.profilePage}>
      <HeroSection
        title="My Profile"
        subtitle="Customize your RaceIQ experience and manage your account settings."
      />
      
      <Container maxW="container.md" py={8}>
        <Box className={styles.settingsCard}>
          <VStack spacing={6} align="stretch">
            {/* Profile Info, Username, etc... */}
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={4} color="var(--color-text-light)">
                Profile Information
              </Text>
              <HStack spacing={4} mb={4}>
                <Avatar 
                  size="lg" 
                  src={user?.picture} 
                  name={user?.name}
                  border="3px solid var(--dynamic-accent-color, var(--color-primary-red))"
                />
                <VStack align="start" spacing={1}>
                  <Text fontSize="lg" fontWeight="semibold" color="var(--color-text-light)">
                    {user?.name}
                  </Text>
                  <Text fontSize="sm" color="var(--color-text-medium)">
                    {user?.email}
                  </Text>
                </VStack>
              </HStack>
            </Box>
            <Divider borderColor="var(--color-border-gray)" />
            <FormControl>
              <FormLabel color="var(--color-text-light)">Username</FormLabel>
              <Input
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter your username"
                bg="var(--color-surface-gray)"
                borderColor="var(--color-border-gray)"
                color="var(--color-text-light)"
                _hover={{ borderColor: 'var(--dynamic-accent-color, var(--color-primary-red))' }}
                _focus={{ borderColor: 'var(--dynamic-accent-color, var(--color-primary-red))', boxShadow: '0 0 0 1px var(--dynamic-accent-color, var(--color-primary-red))' }}
              />
            </FormControl>

            <SearchableSelect
              label="Favorite Team"
              options={transformedConstructorOptions as unknown as SelectOption[]}
              value={(transformedConstructorOptions as any).find((o: SelectOption) => o.value === formData.favoriteTeam) || null}
              onChange={(option) => handleSelectChange('favoriteTeam', option as SelectOption | null)}
              placeholder="Search and select your favorite team"
              isLoading={loading}
            />

            <SearchableSelect
              label="Favorite Driver"
              options={transformedDriverOptions as unknown as SelectOption[]}
              value={(transformedDriverOptions as any).find((o: SelectOption) => o.value === formData.favoriteDriver) || null}
              onChange={(option) => handleSelectChange('favoriteDriver', option as SelectOption | null)}
              placeholder="Search and select your favorite driver"
              isLoading={loading}
            />
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="email-notifications" mb="0" color="var(--color-text-light)">
                Receive occasional email updates and newsletters
              </FormLabel>
              <Switch
                id="email-notifications"
                isChecked={formData.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                colorScheme="red"
              />
            </FormControl>
            <Divider borderColor="var(--color-border-gray)" />
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={4} color="var(--color-text-light)">
                Appearance
              </Text>
              <HStack spacing={4} align="center">
                <Text fontSize="sm" color="var(--color-text-medium)">
                  Switch between light and dark themes:
                </Text>
                <ThemeToggleButton />
              </HStack>
            </Box>
            <Divider borderColor="var(--color-border-gray)" />
            <HStack spacing={4} justify="flex-end">
              <Button
                onClick={handleSendRaceInfo}
                bg="var(--dynamic-accent-color, var(--color-primary-red))"
                color="var(--color-text-light)"
                isDisabled={sending}
                _hover={{
                  bg: 'var(--color-primary-red-dark)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(225, 6, 0, 0.3)'
                }}
              >
                {sending ? 'Sending…' : 'Get race info'}
              </Button>
              <Button
                onClick={handleDeleteAccount}
                variant="outline"
                colorScheme="red"
                borderColor="var(--color-primary-red)"
                color="var(--color-primary-red)"
                _hover={{
                  bg: 'var(--color-primary-red)',
                  color: 'var(--color-text-light)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(225, 6, 0, 0.3)'
                }}
              >
                Delete Account
              </Button>
              <Button
                onClick={handleSaveChanges}
                bg="var(--dynamic-accent-color, var(--color-primary-red))"
                color="var(--color-text-light)"
                _hover={{
                  bg: 'var(--color-primary-red-dark)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(225, 6, 0, 0.3)'
                }}
              >
                Save Changes
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </div>
  );
  
};

export default ProfilePage;