import React, { useState } from 'react';
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
import { teamColors } from '../../lib/teamColors';
import { mockRaces } from '../../data/mockRaces';
import ThemeToggleButton from '../../components/ThemeToggleButton/ThemeToggleButton';
import styles from './ProfilePage.module.css';

// Extract unique driver names from mock races
const getDriverNames = () => {
  const drivers = new Set<string>();
  mockRaces.forEach(race => {
    race.standings.forEach(standing => {
      drivers.add(standing.driver);
    });
  });
  return Array.from(drivers).sort();
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth0();
  const toast = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    username: user?.name || '',
    favoriteTeam: '',
    favoriteDriver: '',
    emailNotifications: false,
  });

  const driverNames = getDriverNames();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    // TODO: Implement save functionality
    toast({
      title: 'Changes saved',
      description: 'Your profile has been updated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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
              >
                {Object.keys(teamColors).map(team => (
                  <option key={team} value={team} style={{ backgroundColor: 'var(--color-surface-gray)', color: 'var(--color-text-light)' }}>
                    {team}
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
              >
                {driverNames.map(driver => (
                  <option key={driver} value={driver} style={{ backgroundColor: 'var(--color-surface-gray)', color: 'var(--color-text-light)' }}>
                    {driver}
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
