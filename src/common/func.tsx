import React, { useEffect } from 'react';

export const useWindowResize = (width: number): boolean => {
  const [isMobile, setIsMobile] = React.useState(false);
  useEffect(() => {
    if (window.innerWidth < width) {
      setIsMobile(true);
    }
    const resize = () => {
      window.innerWidth < width ? setIsMobile(true) : setIsMobile(false);
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return isMobile;
};
