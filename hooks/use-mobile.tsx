'use client';

import { useState, useEffect } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // ПРОСТАЯ ПРОВЕРКА - только по размеру экрана
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Мобильное устройство = узкий экран (меньше 768px ширины)
      const isMobileDevice = screenWidth < 768;
      
      setIsMobile(isMobileDevice);
    };

    // Выполняем проверку при загрузке и при изменении размера окна
    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Очищаем слушатель при выходе
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTelegram: false, isMetaMaskBrowser: false };
}

// Convenience alias to match older import signature
export const useIsMobile = useMobile;
