import { useLocation } from 'react-router-dom';

export const useActiveRoute = (path: string): boolean => {
  const location = useLocation();
  
  // Handle home route specifically
  if (path === '/') {
    return location.pathname === '/';
  }
  
  // For specific routes that should have exact matches, use exact matching
  const exactMatchRoutes = ['/drivers-dashboard', '/about', '/profile'];
  if (exactMatchRoutes.includes(path)) {
    return location.pathname === path;
  }
  
  // Special handling for /standings - should match /standings and /standings/constructors
  if (path === '/standings') {
    return location.pathname === '/standings' || location.pathname.startsWith('/standings/');
  }
  
  // For other routes, check if the current path starts with the given path
  return location.pathname.startsWith(path);
};
