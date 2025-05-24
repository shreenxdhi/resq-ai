import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface LazyComponentProps {
  load: () => Promise<{ default: ComponentType<any> }>;
  loading?: ReactNode;
  [key: string]: any;
}

export function LazyLoadComponent({ load, loading = null, ...props }: LazyComponentProps) {
  const Component = lazy(load);
  
  return (
    <Suspense fallback={loading || <Skeleton height="100%" />}>
      <Component {...props} />
    </Suspense>
  );
}

// Example usage:
// const MapView = lazy(() => import('../components/MapView').then(module => ({ default: module.MapView })));
// <LazyLoadComponent load={() => import('../components/MapView')} componentProps={{ center: [0, 0] }} />
