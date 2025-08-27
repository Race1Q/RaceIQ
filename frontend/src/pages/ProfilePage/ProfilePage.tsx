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
// import { teamColors } from '../../lib/teamColors';
import { supabase } from '../../lib/supabase';
import ThemeToggleButton from '../../components/ThemeToggleButton/ThemeToggleButton';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  const { user } = useAuth0();
  const toast = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    username: user?.name || '',
    favoriteTeam: '' as number | '',
    favoriteDriver: '' as number | '',
    emailNotifications: false,
  });

  // Live driver options (IDs 2..22)
  const [driverOptions, setDriverOptions] = useState<{ id: number; name: string }[]>([]);
  const [driversLoading, setDriversLoading] = useState<boolean>(false);
  const [constructorOptions, setConstructorOptions] = useState<{ id: number; name: string }[]>([]);
  const [constructorsLoading, setConstructorsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        setDriversLoading(true);
        const { data, error } = await supabase
          .from('drivers')
          .select('id, first_name, last_name')
          .gte('id', 2)
          .lte('id', 22)
          .order('id', { ascending: true });

        if (error) throw error;

        const options = (data || []).map(d => ({
          id: d.id as number,
          name: [d.first_name, d.last_name].filter(Boolean).join(' ') || String(d.id),
        }));
        setDriverOptions(options);
      } catch (e: any) {
        toast({
          title: 'Failed to load drivers',
          description: e?.message || 'Unexpected error fetching drivers from database.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setDriversLoading(false);
      }
    };
    loadDrivers();
  }, [toast]);

  useEffect(() => {
    const loadConstructors = async () => {
      try {
        setConstructorsLoading(true);
        const { data, error } = await supabase
          .from('constructors')
          .select('id, name')
          .gte('id', 1)
          .lte('id', 10)
          .order('id', { ascending: true });

        if (error) throw error;

        const options = (data || []).map(c => ({
          id: c.id as number,
          name: (c.name as string) || String(c.id),
        }));
        setConstructorOptions(options);
      } catch (e: any) {
        toast({
          title: 'Failed to load teams',
          description: e?.message || 'Unexpected error fetching teams from database.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setConstructorsLoading(false);
      }
    };
    loadConstructors();
  }, [toast]);

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

      // Persist favorites to public.users
      const favoriteDriverId = formData.favoriteDriver === '' ? null : Number(formData.favoriteDriver);
      const favoriteConstructorId = formData.favoriteTeam === '' ? null : Number(formData.favoriteTeam);

      // Mapping update: public.users primary key is auth0_sub
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ favorite_driver_id: favoriteDriverId, favorite_constructor_id: favoriteConstructorId })
        .eq('auth0_sub', user.sub)
        .select('auth0_sub')
        .maybeSingle();
      if (updateError) throw updateError;
      if (!updated) {
        throw new Error('No user row found for this account (auth0_sub mismatch).');
      }

      toast({
        title: 'Changes saved',
        description: 'Favorites updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (e: any) {
      toast({
        title: 'Failed to save changes',
        description: e?.message || 'Could not update your favorite driver.',
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
                isDisabled={constructorsLoading}
              >
                {constructorsLoading && (
                  <option value="" disabled>Loading teams...</option>
                )}
                {!constructorsLoading && constructorOptions.map(team => (
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
                isDisabled={driversLoading}
              >
                {driversLoading && (
                  <option value="" disabled>Loading drivers...</option>
                )}
                {!driversLoading && driverOptions.map(d => (
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
