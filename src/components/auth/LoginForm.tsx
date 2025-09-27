'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

/**
 * Componente de formulario de login - Mobile First & Responsive
 *
 * @returns Formulario de inicio de sesión optimizado para móvil
 */
export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { signIn, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    await signIn(formData.email, formData.password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 sm:max-w-md sm:px-0">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Email - Mobile Optimized */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-900 sm:text-base"
          >
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className={cn(
              // Base styles - Mobile first
              "w-full px-4 py-3 text-base border border-gray-300 rounded-lg",
              "bg-white text-gray-900 placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "transition-colors duration-200",
              // Touch-friendly for mobile
              "touch-manipulation",
              // Dark mode support
              "dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400",
              "dark:focus:ring-blue-400 dark:focus:border-blue-400"
            )}
            placeholder="tu@email.com"
          />
        </div>

        {/* Campo Password - Mobile Optimized */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-900 sm:text-base"
          >
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className={cn(
              // Base styles - Mobile first
              "w-full px-4 py-3 text-base border border-gray-300 rounded-lg",
              "bg-white text-gray-900 placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "transition-colors duration-200",
              // Touch-friendly for mobile
              "touch-manipulation",
              // Dark mode support
              "dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400",
              "dark:focus:ring-blue-400 dark:focus:border-blue-400"
            )}
            placeholder="••••••••"
          />
        </div>

        {/* Botón Submit - Mobile Optimized */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            // Base styles - Mobile first
            "w-full py-4 px-6 text-base font-semibold rounded-lg",
            "bg-blue-600 text-white",
            "hover:bg-blue-700 active:bg-blue-800",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "transition-all duration-200",
            // Touch-friendly for mobile
            "touch-manipulation min-h-[48px]",
            // Loading state
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600",
            // Dark mode support
            "dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700"
          )}
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Iniciando sesión...</span>
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>
    </div>
  );
}