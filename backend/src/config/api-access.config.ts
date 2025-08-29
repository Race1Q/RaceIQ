// Configuration for API access control
export const API_ACCESS_CONFIG = {
  // Public endpoints (no authentication required)
  publicEndpoints: [
    {
      path: '/driver-standings',
      methods: ['GET'],
      description: 'Driver standings data - publicly accessible'
    },
    {
      path: '/driver-standings/*',
      methods: ['GET'],
      description: 'All driver standings endpoints - publicly accessible'
    }
  ],

  // Protected endpoints (authentication required)
  protectedEndpoints: [
    {
      path: '/drivers',
      methods: ['GET', 'POST'],
      description: 'Driver data - requires authentication'
    },
    {
      path: '/admin/*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      description: 'Admin endpoints - requires admin privileges'
    },
    {
      path: '/users/*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      description: 'User management - requires authentication'
    }
  ],

  // Endpoints that require specific scopes
  scopedEndpoints: [
    {
      path: '/drivers/ingest',
      method: 'POST',
      scope: 'write:drivers',
      description: 'Driver data ingestion - requires write permission'
    },
    {
      path: '/driver-standings/ingest',
      method: 'POST',
      scope: 'write:driver-standings',
      description: 'Driver standings ingestion - requires write permission'
    }
  ]
};

// Helper function to check if an endpoint is public
export function isPublicEndpoint(path: string, method: string): boolean {
  return API_ACCESS_CONFIG.publicEndpoints.some(endpoint => {
    const pathMatch = endpoint.path === path || 
                     (endpoint.path.endsWith('*') && path.startsWith(endpoint.path.slice(0, -1)));
    const methodMatch = endpoint.methods.includes(method);
    return pathMatch && methodMatch;
  });
}

// Helper function to get required scope for an endpoint
export function getRequiredScope(path: string, method: string): string | null {
  const scopedEndpoint = API_ACCESS_CONFIG.scopedEndpoints.find(endpoint => {
    const pathMatch = endpoint.path === path || 
                     (endpoint.path.endsWith('*') && path.startsWith(endpoint.path.slice(0, -1)));
    const methodMatch = endpoint.method === method;
    return pathMatch && methodMatch;
  });
  
  return scopedEndpoint?.scope || null;
}
