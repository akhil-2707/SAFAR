import { useState, useEffect, useRef } from 'react';

/**
 * Custom React Hook for Real Live Browser GPS Telemetry Tracking
 * Wraps navigator.geolocation.getCurrentPosition and watchPosition.
 * Provides permission denial status and fallback state.
 */
export function useBrowserGeolocation(options = {}) {
  const [coords, setCoords] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
    ...options
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setPermissionStatus('unsupported');
      setError('Geolocation sensor is not supported by this browser');
      setIsLive(false);
      return;
    }

    setLoadingState();

    // 1. Initial Position Lock
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleSuccess(position);
      },
      (err) => {
        handleError(err);
      },
      defaultOptions
    );

    // 2. Continuous Real-time Position Watcher
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        handleSuccess(position);
      },
      (err) => {
        handleError(err);
      },
      defaultOptions
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLive(false);
  };

  const setLoadingState = () => {
    setError(null);
  };

  const handleSuccess = (position) => {
    const { latitude, longitude, accuracy, speed, heading } = position.coords;
    setCoords({
      lat: latitude,
      lng: longitude,
      accuracyMeters: Math.round(accuracy || 10),
      speedKmH: speed ? Math.round(speed * 3.6 * 10) / 10 : 0,
      headingDeg: heading ? Math.round(heading) : 0,
      timestamp: new Date(position.timestamp).toISOString()
    });
    setIsLive(true);
    setPermissionStatus('granted');
    setError(null);
  };

  const handleError = (err) => {
    setIsLive(false);
    if (err.code === err.PERMISSION_DENIED) {
      setPermissionStatus('denied');
      setError('Location permission denied by user. Falling back to Demo Simulator.');
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      setPermissionStatus('unsupported');
      setError('GPS position unavailable. Falling back to Demo Simulator.');
    } else if (err.code === err.TIMEOUT) {
      setError('GPS request timed out. Retrying...');
    } else {
      setError(err.message || 'GPS tracking error');
    }
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    coords,
    isLive,
    permissionStatus,
    error,
    startTracking,
    stopTracking
  };
}
