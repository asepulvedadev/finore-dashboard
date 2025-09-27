import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

/**
 * Página de inicio de sesión - Mobile First & Responsive
 *
 * @returns Página con formulario de login optimizado para móvil
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Container principal - Mobile first */}
      <div className="flex min-h-screen flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          {/* Header - Responsive */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
              Bienvenido de vuelta
            </h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 sm:mt-4 sm:text-base">
              ¿No tienes cuenta?{' '}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Formulario - Mobile optimized */}
          <div className="mt-8 sm:mt-10">
            <LoginForm />
          </div>

          {/* Footer links - Mobile friendly */}
          <div className="mt-8 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}