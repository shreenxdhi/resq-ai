import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type LazyComponentProps = {
  load: () => Promise<{ default: ComponentType<any> }>;
  loading?: React.ReactNode;
  [key: string]: any;
};

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
