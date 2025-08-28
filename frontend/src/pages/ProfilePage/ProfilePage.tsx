import React, { useEffect, useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Box,
  VStack,
  HStack,
  Text,
  Input,
  // The original Select is no longer needed from Chakra UI for these forms
  Switch,
  Button,
  Avatar,
  FormControl,
  FormLabel,
  Divider,
  useToast,
} from '@chakra-ui/react';
// 1. Import the new Select component
import { Select } from 'chakra-react-select';
import HeroSection from '../../components/HeroSection/HeroSection';
import ThemeToggleButton from '../../components/ThemeToggleButton/ThemeToggleButton';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  const { user, getAccessTokenSilently } = useAuth0();
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

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

        const constructorsResponse = await fetch('/api/constructors', { headers });
        if (constructorsResponse.ok) {
          const constructorsData = await constructorsResponse.json();
          setConstructorOptions(constructorsData);
        }

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
  
  // 2. Prepare options for react-select, memoizing for performance
  const transformedConstructorOptions = useMemo(() =>
    constructorOptions.map(team => ({ value: team.id, label: team.name })),
    [constructorOptions]
  );

  const transformedDriverOptions = useMemo(() =>
    driverOptions.map(driver => ({ value: driver.id, label: driver.name })),
    [driverOptions]
  );

  const handleSelectChange = (field: 'favoriteDriver' | 'favoriteTeam', selectedOption: { value: number; label: string } | null) => {
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
      if (!user?.sub) {
        throw new Error('No authenticated user');
      }
      const token = await getAccessTokenSilently();
      const payload = {
        username: formData.username || undefined,
        favorite_constructor_id: formData.favoriteTeam === '' ? null : Number(formData.favoriteTeam),
        favorite_driver_id: formData.favoriteDriver === '' ? null : Number(formData.favoriteDriver),
      };
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
  };

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: 'var(--color-surface-gray)',
      borderColor: 'var(--color-border-gray)',
      color: 'var(--color-text-light)',
      '&:hover': {
        borderColor: 'var(--dynamic-accent-color, var(--color-primary-red))',
      },
      boxShadow: 'none',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'var(--color-surface-gray)',
      border: '1px solid var(--color-border-gray)',
    }),
    option: (provided: any, state: { isSelected: boolean, isFocused: boolean }) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'var(--color-surface-gray-light)' : 'var(--color-surface-gray)',
      color: 'var(--color-text-light)',
      '&:active': {
        backgroundColor: 'var(--color-border-gray)',
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'var(--color-text-light)',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'var(--color-text-light)',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'var(--color-text-muted)',
    }),
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

            {/* Favorite Team */}
            <FormControl>
              <FormLabel color="var(--color-text-light)">Favorite Team</FormLabel>
              <Select
                options={transformedConstructorOptions}
                value={transformedConstructorOptions.find(o => o.value === formData.favoriteTeam) || null}
                onChange={(option) => handleSelectChange('favoriteTeam', option)}
                placeholder="Search and select your favorite team"
                isClearable
                isLoading={loading}
                isDisabled={loading}
                chakraStyles={customSelectStyles}
                focusBorderColor="var(--dynamic-accent-color, var(--color-primary-red))"
              />
            </FormControl>

            {/* Favorite Driver */}
            <FormControl>
              <FormLabel color="var(--color-text-light)">Favorite Driver</FormLabel>
              <Select
                options={transformedDriverOptions}
                value={transformedDriverOptions.find(o => o.value === formData.favoriteDriver) || null}
                onChange={(option) => handleSelectChange('favoriteDriver', option)}
                placeholder="Search and select your favorite driver"
                isClearable
                isLoading={loading}
                isDisabled={loading}
                chakraStyles={customSelectStyles}
                focusBorderColor="var(--dynamic-accent-color, var(--color-primary-red))"
              />
            </FormControl>
            
            {/* Other sections */}
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