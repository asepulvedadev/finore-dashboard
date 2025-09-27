'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

/**
 * Componente para mostrar prompt de instalación PWA
 *
 * @returns Componente de instalación PWA
 */
export function InstallPrompt() {
  const { canShowInstallPrompt, installPWA, dismissInstallPrompt, getDeviceInfo } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const deviceInfo = getDeviceInfo();

  useEffect(() => {
    // Mostrar el prompt después de un pequeño delay para mejor UX
    if (canShowInstallPrompt()) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [canShowInstallPrompt]);

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      await installPWA();
      setIsVisible(false);
    } catch (error) {
      console.error('Error al instalar:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setIsVisible(false);
  };

  if (!isVisible || !canShowInstallPrompt()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700",
        "p-4 transform transition-all duration-300 ease-out",
        "animate-in slide-in-from-bottom-4"
      )}>
        {/* Header con icono */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Instalar Finore Dashboard
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Obtén la mejor experiencia instalando la app en tu dispositivo
            </p>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Características */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Acceso rápido desde tu pantalla de inicio</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Funcionamiento offline</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Notificaciones push (próximamente)</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-4 flex space-x-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg",
              "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[40px] flex items-center justify-center"
            )}
          >
            {isInstalling ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Instalando...</span>
              </div>
            ) : (
              'Instalar'
            )}
          </button>
        </div>

        {/* Información del dispositivo */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Compatible con {deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'tu dispositivo'}
          </p>
        </div>
      </div>
    </div>
  );
}