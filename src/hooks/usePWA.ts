'use client';

import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar funcionalidades PWA
 *
 * @returns Estado y funciones para PWA
 */
export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Detectar si estamos en un navegador que soporta PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const isTWA = document.referrer.includes('android-app://');

    setIsInstalled(isPWA || isTWA);

    // Escuchar eventos de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Registrar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial de conexión
    setIsOnline(navigator.onLine);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Instalar la PWA
   *
   * @returns Promise que se resuelve cuando se completa la instalación
   */
  const installPWA = async () => {
    if (!deferredPrompt) {
      throw new Error('La aplicación no está disponible para instalación');
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }

      setDeferredPrompt(null);
      return outcome;
    } catch (error) {
      console.error('Error al instalar PWA:', error);
      throw error;
    }
  };

  /**
   * Verificar si podemos mostrar el prompt de instalación
   *
   * @returns true si se puede mostrar el prompt
   */
  const canShowInstallPrompt = () => {
    // Solo mostrar en móvil y cuando esté disponible
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasNotBeenDismissed = localStorage.getItem('pwa-install-dismissed') !== 'true';

    return isInstallable && isMobile && hasNotBeenDismissed && !isInstalled;
  };

  /**
   * Marcar el prompt como descartado
   */
  const dismissInstallPrompt = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setIsInstallable(false);
  };

  /**
   * Obtener información del dispositivo
   */
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);

    return {
      isIOS,
      isAndroid,
      isChrome,
      isFirefox,
      isSafari,
      isEdge,
      isMobile: isIOS || isAndroid || /Mobi|Android/i.test(userAgent),
      isDesktop: !/Mobi|Android/i.test(userAgent)
    };
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    canShowInstallPrompt,
    installPWA,
    dismissInstallPrompt,
    getDeviceInfo
  };
}