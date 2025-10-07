import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Box,
  VStack,
  HStack,
  Flex,
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
  SimpleGrid,
} from '@chakra-ui/react';
import SearchableSelect from '../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import PageHeader from '../../components/layout/PageHeader';
import ThemeToggleButton from '../../components/ThemeToggleButton/ThemeToggleButton';
import styles from './ProfilePage.module.css';
import { buildApiUrl } from '../../lib/api';
import { useProfile } from '../../hooks/useProfile';
import { sendRaceUpdate } from '../../services/notifications';
import { useProfileUpdate } from '../../context/ProfileUpdateContext';
import { driverHeadshots } from '../../lib/driverHeadshots';
import { useThemeColor } from '../../context/ThemeColorContext';

// Extended interface to include the new field
interface ExtendedProfileResponse {
  id: number;
  auth0_sub: string;
  username: string | null;
  email: string | null;
  favorite_driver_id: number | null;
  favorite_constructor_id: number | null;
  theme_preference?: 'dark' | 'light' | null;
  use_custom_team_color?: boolean;
}

// SelectOption type imported from SearchableSelect component

const ProfilePage: React.FC = () => {
  // 1. Get the isLoading flag from the hook
  const { user, getAccessTokenSilently, isLoading } = useAuth0();
  const { profile, updateProfile } = useProfile();
  const { triggerRefresh } = useProfileUpdate();
  const { useCustomTeamColor, toggleCustomTeamColor } = useThemeColor();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    username: user?.name || '',
    favoriteTeam: '' as number | '',
    favoriteDriver: '' as number | '',
    emailNotifications: false,
  });

  interface DriverOpt { id: number; name?: string; full_name?: string; first_name?: string; last_name?: string }
  const [driverOptions, setDriverOptions] = useState<DriverOpt[]>([]);
  const [constructorOptions, setConstructorOptions] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [pendingTheme, setPendingTheme] = useState<'light' | 'dark' | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

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

  // Get the favorite driver's headshot for profile picture
  const profilePictureSrc = useMemo(() => {
    if (profile?.favorite_driver_id && driverOptions.length > 0) {
      const favoriteDriver = driverOptions.find((driver) => driver.id === profile.favorite_driver_id);
      if (favoriteDriver) {
        const driverName = favoriteDriver.full_name || favoriteDriver.name || [favoriteDriver.first_name, favoriteDriver.last_name].filter(Boolean).join(' ');
        if (driverName) {
          return driverHeadshots[driverName] || user?.picture;
        }
      }
    }
    return user?.picture;
  }, [profile?.favorite_driver_id, driverOptions, user?.picture]);

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
      
      // Check if any changes were made
      const hasChanges = 
        (formData.username !== (profile?.username || user?.name || '')) ||
        (formData.favoriteTeam !== (profile?.favorite_constructor_id ?? '')) ||
        (formData.favoriteDriver !== (profile?.favorite_driver_id ?? '')) ||
        (pendingTheme && pendingTheme !== profile?.theme_preference) ||
        (useCustomTeamColor !== (profile as ExtendedProfileResponse)?.use_custom_team_color);

      if (!hasChanges) {
        toast({
          title: 'No changes made',
          description: 'Your profile is already up to date.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const payload: any = {
        username: formData.username || undefined,
        favorite_constructor_id: formData.favoriteTeam === '' ? null : Number(formData.favoriteTeam),
        favorite_driver_id: formData.favoriteDriver === '' ? null : Number(formData.favoriteDriver),
        use_custom_team_color: useCustomTeamColor,
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
      const races = await authedFetch(buildApiUrl('/api/races'));
      const now = new Date();
      const upcoming = (races || [])
        .filter((r: any) => new Date(r.date) >= now)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

      if (!upcoming.length) {
        toast({
          title: 'No upcoming races',
          description: 'There are no future races available.',
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
      const message = `Next ${upcoming.length} Upcoming Race${upcoming.length > 1 ? 's' : ''}:\n\n${lines.join('\n')}`;

      // Acquire token for protected notifications endpoint
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'read:drivers read:constructors read:standings update:users',
        },
      });
      
      console.log('Auth0 audience:', import.meta.env.VITE_AUTH0_AUDIENCE);
      console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
      
      await sendRaceUpdate({ raceDetails: message }, token);

      toast({
        title: 'Email sent',
        description: `We emailed you the next ${upcoming.length} race${upcoming.length > 1 ? 's' : ''}.`,
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
    <Box bg="bg-primary" minH="100vh">
      <PageHeader
        title="My Profile"
        subtitle="Customize your RaceIQ experience and manage your account settings"
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
                  src={profilePictureSrc} 
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

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
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
            </SimpleGrid>
            
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
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} align="center">
                  <Text fontSize="sm" color="var(--color-text-medium)">
                    Switch between light and dark themes:
                  </Text>
                  <ThemeToggleButton onToggle={(theme) => setPendingTheme(theme)} />
                </HStack>
                <HStack spacing={4} align="center">
                  <Text fontSize="sm" color="var(--color-text-medium)">
                    Use custom team colors:
                  </Text>
                  <Switch
                    isChecked={useCustomTeamColor}
                    onChange={toggleCustomTeamColor}
                    colorScheme="red"
                    size="md"
                  />
                  <Text fontSize="xs" color="var(--color-text-medium)" maxW="200px">
                    {useCustomTeamColor 
                      ? "Colors match your favorite team" 
                      : "Use default red theme colors"}
                  </Text>
                </HStack>
              </VStack>
            </Box>
            <Divider borderColor="var(--color-border-gray)" />
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify={{ base: 'stretch', md: 'flex-end' }}
              gap={4}
              wrap="wrap"
            >
              <Button
                onClick={handleSendRaceInfo}
                colorScheme="red"
                variant="outline"
                isDisabled={sending}
                size={{ base: 'sm', md: 'md' }}
                w={{ base: 'full', md: 'auto' }}
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
                size={{ base: 'sm', md: 'md' }}
                w={{ base: 'full', md: 'auto' }}
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
                size={{ base: 'sm', md: 'md' }}
                w={{ base: 'full', md: 'auto' }}
                _hover={{
                  transform: 'translateY(-2px)'
                }}
              >
                Save Changes
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Container>

      {/* Delete Account Confirmation Dialog */}
  <AlertDialog isOpen={isOpen} onClose={onClose} isCentered leastDestructiveRef={cancelRef}>
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
                ref={cancelRef}
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
    </Box>
  );
  
};

export default ProfilePage;