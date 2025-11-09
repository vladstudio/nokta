import { useEffect, useState } from 'react';

const mq = matchMedia('(max-width:639px)');

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(mq.matches);
  useEffect(() => {
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
};
