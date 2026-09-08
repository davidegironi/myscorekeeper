// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import { useEffect, useRef } from 'react';

/**
 * Check if the component is mounted or unmounted
 * @returns {object} ref object with a boolean property `current` that is true if the component is mounted, false if unmounted
 */
export default function useIsMounted() {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return mounted;
}
