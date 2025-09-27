'use client';

import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

/**
 * Componente para mostrar estado PWA y conectividad
 *
 * @returns Indicador de estado PWA
 */
export function PWAStatus() {
  const { isInstalled, isOnline, getDeviceInfo } = usePWA();
  const deviceInfo = getDeviceInfo();

  // Solo mostrar en desarrollo o cuando hay información relevante
  if (process.env.NODE_ENV === 'production' && isInstalled && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col space-y-2">
      {/* Estado de conexión */}
      <div className={cn(
        "px-3 py-2 rounded-lg text-sm font-medium shadow-lg",
        "flex items-center space-x-2",
        isOnline
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      )}>
        <div className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-green-500" : "bg-red-500"
        )} />
        <span>{isOnline ? 'En línea' : 'Sin conexión'}</span>
      </div>

      {/* Estado PWA - Solo mostrar si no está instalado */}
      {!isInstalled && (
        <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Disponible para instalar</span>
          </div>
        </div>
      )}

      {/* Información del dispositivo - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg text-xs shadow-lg max-w-xs">
          <div className="space-y-1">
            <div>Dispositivo: {deviceInfo.isMobile ? 'Móvil' : 'Desktop'}</div>
            <div>Navegador: {deviceInfo.isChrome ? 'Chrome' : deviceInfo.isFirefox ? 'Firefox' : deviceInfo.isSafari ? 'Safari' : deviceInfo.isEdge ? 'Edge' : 'Otro'}</div>
            <div>Sistema: {deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'Otro'}</div>
          </div>
        </div>
      )}
    </div>
  );
}