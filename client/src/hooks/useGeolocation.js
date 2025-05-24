import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState({
    loaded: false,
    coordinates: null,
    error: null
  });

  const onSuccess = (position) => {
    setLocation({
      loaded: true,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      },
      error: null
    });
  };

  const onError = (error) => {
    setLocation({
      loaded: true,
      coordinates: null,
      error: {
        code: error.code,
        message: error.message
      }
    });
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      onError({
        code: 0,
        message: "Geolocation not supported"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, []);

  return location;
};

export default useGeolocation;
