import { matchRoutes, useLocation } from 'react-router-dom';

const routes = [{ path: '/test/i/:id' }];

export function useCurrentPath() {
  const location = useLocation();
  const routeMatch = matchRoutes(routes, location);
  if (!routeMatch) {
    return null;
  }

  return routeMatch[0].route.path;
}
