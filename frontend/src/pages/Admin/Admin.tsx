// frontend/src/pages/Admin/Admin.tsx

import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Container,
  Button,
} from '@chakra-ui/react';

// --- Local AdminStatCard Component ---
interface AdminStatCardProps {
  title: string;
  value: string;
  subtitle: string;
  status?: 'success' | 'warning' | 'error';
  icon?: React.ComponentType;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, subtitle, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'brand.greenAccent';
      // Add other cases for warning/error if needed
      default:
        return 'text-primary';
    }
  };

  return (
    <VStack
      bg="bg-surface-raised"
      p="md"
      borderRadius="md"
      borderWidth="1px"
      borderColor="border-primary"
      textAlign="center"
      spacing={1}
    >
      <Heading size="sm" color="brand.red" fontFamily="ui">
        {title}
      </Heading>
      <Text
        color={getStatusColor()}
        fontSize={status ? '1.2rem' : '2rem'}
        fontWeight="bold"
        fontFamily="heading"
      >
        {value}
      </Text>
      <Text fontSize="sm" color="text-muted">
        {subtitle}
      </Text>
    </VStack>
  );
};

// --- Main Admin Page Component ---
const AdminPage: React.FC = () => {
  const activityItems = [
    'New user registration: John Doe',
    'API rate limit exceeded for IP: 192.168.1.100',
    'Database backup completed successfully',
    'System maintenance scheduled for 2:00 AM',
    'Cache cleared for race data',
  ];

  return (
    <Container maxW="container.xl" pt={{ base: 20, md: '100px' }} pb="xl">
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" color="brand.red" fontFamily="heading">
          Admin Dashboard
        </Heading>

        {/* Overview Section */}
        <Box
          bg="bg-surface"
          p={{ base: 'md', md: 'xl' }}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border-primary"
        >
          <VStack spacing={8} align="stretch">
            <Heading as="h2" size="lg" color="text-primary" fontFamily="heading">
              System Overview
            </Heading>

            {/* Statistics Grid using the local component */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <AdminStatCard title="Total Users" value="1,247" subtitle="+12% this week" />
              <AdminStatCard title="Active Sessions" value="89" subtitle="Currently online" />
              <AdminStatCard title="API Calls" value="45.2K" subtitle="Today" />
              <AdminStatCard title="System Status" value="Healthy" subtitle="All systems operational" status="success" />
            </SimpleGrid>

            {/* Admin Tools Grid */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="lg">
              {/* Quick Actions Card */}
              <VStack
                bg="bg-surface-raised"
                p={{ base: 'md', md: '25px' }}
                borderRadius="md"
                borderWidth="1px"
                borderColor="border-primary"
                align="stretch"
                spacing={4}
              >
                <Heading size="md" color="brand.red" fontFamily="heading">
                  Quick Actions
                </Heading>
                <VStack align="stretch" spacing="sm">
                  <Button
                    bg="brand.red"
                    color="white"
                    _hover={{ bg: 'brand.redDark', transform: 'translateY(-2px)', boxShadow: 'md' }}
                  >
                    Refresh Data Cache
                  </Button>
                  <Button
                    variant="outline"
                    borderColor="border-primary"
                    _hover={{ bg: 'bg-surface', borderColor: 'text-secondary' }}
                  >
                    View System Logs
                  </Button>
                  <Button
                    variant="outline"
                    borderColor="border-primary"
                    _hover={{ bg: 'bg-surface', borderColor: 'text-secondary' }}
                  >
                    Manage Users
                  </Button>
                </VStack>
              </VStack>

              {/* Recent Activity Card */}
              <VStack
                bg="bg-surface-raised"
                p={{ base: 'md', md: '25px' }}
                borderRadius="md"
                borderWidth="1px"
                borderColor="border-primary"
                align="stretch"
                spacing={4}
              >
                <Heading size="md" color="brand.red" fontFamily="heading">
                  Recent Activity
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {activityItems.map((item, index) => (
                    <Text key={index} fontSize="sm" color="text-secondary">
                      • {item}
                    </Text>
                  ))}
                </VStack>
              </VStack>
            </SimpleGrid>

            {/* Admin Features Section */}
            <VStack
              bg="bg-surface-raised"
              p="md"
              borderRadius="md"
              borderWidth="1px"
              borderColor="border-primary"
              align="stretch"
              spacing={3}
            >
              <Heading size="md" color="brand.red" fontFamily="heading">
                Admin Features
              </Heading>
              <Text color="text-secondary" fontSize="sm">
                This admin dashboard provides system monitoring, user management, and configuration tools.
              </Text>
              <Text color="text-secondary" fontSize="sm">
                Coming soon: Advanced analytics, automated alerts, and performance optimization tools.
              </Text>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default AdminPage;