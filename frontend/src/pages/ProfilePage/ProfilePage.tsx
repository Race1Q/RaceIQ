import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Switch,
  Button,
  Avatar,
  FormControl,
  FormLabel,
  Divider,
  useToast,
} from '@chakra-ui/react';
import HeroSection from '../../components/HeroSection/HeroSection';
import ThemeToggleButton from '../../components/ThemeToggleButton/ThemeToggleButton';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const toast = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    username: user?.name || '',
    favoriteTeam: '' as number | '',
    favoriteDriver: '' as number | '',
    emailNotifications: false,
  });

  // Options for dropdowns
  const [driverOptions, setDriverOptions] = useState<{ id: number; name: string }[]>([]);
  const [constructorOptions, setConstructorOptions] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all initial data from backend
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch user profile
        const profileResponse = await fetch('/api/users/me', { headers });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setFormData(prev => ({
            ...prev,
            username: profileData.databaseUser?.username || user?.name || '',
            favoriteTeam: profileData.databaseUser?.favorite_constructor_id || '',
            favoriteDriver: profileData.databaseUser?.favorite_driver_id || '',
          }));
        }

        // Fetch constructors
        const constructorsResponse = await fetch('/api/constructors', { headers });
        if (constructorsResponse.ok) {
          const constructorsData = await constructorsResponse.json();
          setConstructorOptions(constructorsData);
        }

        // Fetch drivers
        const driversResponse = await fetch('/api/drivers', { headers });
        if (driversResponse.ok) {
          const driversData = await driversResponse.json();
          setDriverOptions(driversData);
        }
      } catch (error: any) {
        toast({
          title: 'Failed to load profile data',
          description: error?.message || 'Unexpected error fetching data from server.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [user, getAccessTokenSilently, toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: (field === 'favoriteDriver' || field === 'favoriteTeam')
        ? (value === '' ? '' : Number(value))
        : value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      if (!user?.sub) {
        throw new Error('No authenticated user');
      }

      // Get JWT token
      const token = await getAccessTokenSilently();
      
      // Create payload with only updatable fields
      const payload = {
        username: formData.username || undefined,
        favorite_constructor_id: formData.favoriteTeam === '' ? null : Number(formData.favoriteTeam),
        favorite_driver_id: formData.favoriteDriver === '' ? null : Number(formData.favoriteDriver),
      };

      // Make PATCH request to backend
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

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
        description: error?.message || 'Could not update your profile.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account functionality
    toast({
      title: 'Account deletion',
      description: 'This feature will be implemented in a future update.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <div className={styles.profilePage}>
      <HeroSection
        title="My Profile"
        subtitle="Customize your RaceIQ experience and manage your account settings."
        backgroundImageUrl="https://images.pexels.com/photos/29252131/pexels-photo-29252131.jpeg"
      />
      
      <Container maxW="container.md" py={8}>
        <Box className={styles.settingsCard}>
          <VStack spacing={6} align="stretch">
            {/* Profile Information */}
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

            {/* Username */}
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

            {/* Favorite Team */}
            <FormControl>
              <FormLabel color="var(--color-text-light)">Favorite Team</FormLabel>
              <Select
                value={formData.favoriteTeam}
                onChange={(e) => handleInputChange('favoriteTeam', e.target.value)}
                placeholder="Select your favorite team"
                bg="var(--color-surface-gray)"
                borderColor="var(--color-border-gray)"
                color="var(--color-text-light)"
                _hover={{ borderColor: 'var(--dynamic-accent-color, var(--color-primary-red))' }}
                _focus={{ borderColor: 'var(--dynamic-accent-color, var(--color-primary-red))', boxShadow: '0 0 0 1px var(--dynamic-accent-color, var(--color-primary-red))' }}
                isDisabled={loading}
              >
                {loading && (
                  <option value="" disabled>Loading teams...</option>
                )}
                {!loading && constructorOptions.map(team => (
                  <option key={team.id} value={team.id} style={{ backgroundColor: 'var(--color-surface-gray)', color: 'var(--color-text-light)' }}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Favorite Driver */}
            <FormControl>
              <FormLabel color="var(--color-text-light)">Favorite Driver</FormLabel>
              <Select
                value={formData.favoriteDriver}
                onChange={(e) => handleInputChange('favoriteDriver', e.target.value)}
                placeholder="Select your favorite driver"
                bg="var(--color-surface-gray)"
                borderColor="var(--color-border-gray)"
                color="var(--color-text-light)"
                _hover={{ borderColor: 'var(--dynamic-accent-color, var(--color-primary-red))' }}
                _focus={{ borderColor: 'var(--dynamic-accent-color, var(--color-primary-red))', boxShadow: '0 0 0 1px var(--dynamic-accent-color, var(--color-primary-red))' }}
                isDisabled={loading}
              >
                {loading && (
                  <option value="" disabled>Loading drivers...</option>
                )}
                {!loading && driverOptions.map(d => (
                  <option key={d.id} value={d.id} style={{ backgroundColor: 'var(--color-surface-gray)', color: 'var(--color-text-light)' }}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Email Notifications */}
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

            {/* Appearance Section */}
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

            {/* Action Buttons */}
            <HStack spacing={4} justify="flex-end">
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
