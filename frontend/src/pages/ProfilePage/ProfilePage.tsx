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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import SearchableSelect from '../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import HeroSection from '../../components/HeroSection/HeroSection';
import ThemeToggleButton from '../../components/ThemeToggleButton/ThemeToggleButton';
import styles from './ProfilePage.module.css';
import { buildApiUrl } from '../../lib/api';
import { useProfile } from '../../hooks/useProfile';
import { sendRaceUpdate } from '../../services/notifications';
import { useProfileUpdate } from '../../context/ProfileUpdateContext';

// SelectOption type imported from SearchableSelect component

const ProfilePage: React.FC = () => {
  // 1. Get the isLoading flag from the hook
  const { user, getAccessTokenSilently, isLoading } = useAuth0();
  const { profile, loading: isProfileLoading, updateProfile } = useProfile();
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
  const [saving, setSaving] = useState<boolean>(false);
  const [pendingTheme, setPendingTheme] = useState<'light' | 'dark' | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const authedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'read:drivers read:constructors read:standings delete:users update:users',
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


  // Sync form state from profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        username: profile.username || user?.name || '',
        favoriteTeam: profile.favorite_constructor_id ?? '',
        favoriteDriver: profile.favorite_driver_id ?? '',
      }));
      // reflect theme into pendingTheme so save can persist it
      if (profile.theme_preference === 'light' || profile.theme_preference === 'dark') {
        setPendingTheme(profile.theme_preference);
      }
    }
  }, [profile, user?.name]);

  // Fetch latest season, then load constructors/drivers for that season
  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        setLoading(true);
        const seasons = await authedFetch(buildApiUrl('/api/seasons'));
        if (!seasons || seasons.length === 0) {
          throw new Error('No seasons data available.');
        }
        const latestYear = seasons[0].year;
        const [constructorsData, driversData] = await Promise.all([
          authedFetch(buildApiUrl(`/api/constructors?year=${latestYear}`)),
          authedFetch(buildApiUrl(`/api/drivers?year=${latestYear}`)),
        ]);
        setConstructorOptions(constructorsData);
        setDriverOptions(driversData);
      } catch (err: any) {
        toast({
          title: 'Could not load selection lists',
          description: err instanceof Error ? err.message : 'An unknown error occurred.',
          status: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    if (user && !isLoading) {
      fetchSelectOptions();
    }
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
      setSaving(true);
      const payload: any = {
        username: formData.username || undefined,
        favorite_constructor_id: formData.favoriteTeam === '' ? null : Number(formData.favoriteTeam),
        favorite_driver_id: formData.favoriteDriver === '' ? null : Number(formData.favoriteDriver),
      };
      if (pendingTheme) {
        payload.theme_preference = pendingTheme;
      }
      await updateProfile(payload);
      // Optimistically sync
      setFormData(prev => ({
        ...prev,
        favoriteTeam: payload.favorite_constructor_id === null ? '' : Number(payload.favorite_constructor_id),
        favoriteDriver: payload.favorite_driver_id === null ? '' : Number(payload.favorite_driver_id),
      }));
      triggerRefresh();
      toast({
        title: 'Changes Saved',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to save changes',
        description: 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    onOpen();
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeleting(true);
      await authedFetch(buildApiUrl('/api/profile'), { method: 'DELETE' });
      toast({ title: 'Account deleted', status: 'success', duration: 3000, isClosable: true });
      onClose();
      // Log out the user immediately after successful deletion
      window.location.href = '/api/auth/logout';
    } catch (e: any) {
      toast({ title: 'Failed to delete account', description: e.message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setDeleting(false);
    }
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
                <ThemeToggleButton onToggle={(theme) => setPendingTheme(theme)} />
              </HStack>
            </Box>
            <Divider borderColor="var(--color-border-gray)" />
            <HStack spacing={4} justify="flex-end">
              <Button
                onClick={handleSendRaceInfo}
                colorScheme="blue"
                variant="outline"
                isDisabled={sending}
                _hover={{
                  transform: 'translateY(-2px)'
                }}
              >
                {sending ? 'Sending…' : 'Get race info'}
              </Button>
              <Button
                onClick={handleDeleteAccount}
                colorScheme="red"
                variant="outline"
                isLoading={deleting}
                loadingText="Deleting"
                _hover={{
                  transform: 'translateY(-2px)'
                }}
              >
                Delete Account
              </Button>
              <Button
                onClick={handleSaveChanges}
                colorScheme="green"
                isLoading={saving}
                loadingText="Saving"
                isDisabled={saving}
                _hover={{
                  transform: 'translateY(-2px)'
                }}
              >
                Save Changes
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Container>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
          <AlertDialogContent bg="var(--color-surface-gray)" border="1px solid var(--color-border-gray)" boxShadow="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="var(--color-text-light)">
              Delete Account
            </AlertDialogHeader>

            <AlertDialogBody color="var(--color-text-medium)">
              <Text mb={4}>
                This action will permanently delete your account and cannot be undone. You will also immediately be logged out.
              </Text>
              <Text fontWeight="semibold" color="var(--color-primary-red)">
                Are you sure you want to continue?
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                onClick={onClose} 
                colorScheme="gray" 
                variant="outline"
                mr={3}
                _hover={{ transform: 'translateY(-1px)' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDeleteAccount}
                colorScheme="red"
                isLoading={deleting}
                loadingText="Deleting..."
                _hover={{ transform: 'translateY(-1px)' }}
              >
                Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
  
};

export default ProfilePage;