import React, { lazy, Suspense, ComponentType, ReactNode } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface LazyComponentProps<T = Record<string, unknown>> {
  load: () => Promise<{ default: ComponentType<T> }>;
  loading?: ReactNode;
  componentProps?: T;
}

export function LazyLoadComponent<T = Record<string, unknown>>({ 
  load, 
  loading = <Skeleton height="100%" />, 
  componentProps 
}: LazyComponentProps<T>): JSX.Element {
  const Component = lazy(load);
  
  return (
    <Suspense fallback={loading}>
      <Component {...(componentProps || {}) as T} />
    </Suspense>
  );
}

// Example usage:
// const MapView = lazy(() => import('../components/MapView').then(module => ({ default: module.MapView })));
// <LazyLoadComponent load={() => import('../components/MapView')} componentProps={{ center: [0, 0] }} />
