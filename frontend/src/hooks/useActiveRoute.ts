import { useLocation } from 'react-router-dom';

export const useActiveRoute = (path: string): boolean => {
  const location = useLocation();
  
  // Handle home route specifically
  if (path === '/') {
    return location.pathname === '/';
  }
  
  // For specific routes that should have exact matches, use exact matching
  const exactMatchRoutes = ['/drivers', '/drivers-dashboard', '/races', '/about', '/admin', '/standings'];
  if (exactMatchRoutes.includes(path)) {
    return location.pathname === path;
  }
  
  // For other routes, check if the current path starts with the given path
  return location.pathname.startsWith(path);
};
