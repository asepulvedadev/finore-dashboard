import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

/**
 * Página de registro de usuario - Mobile First & Responsive
 *
 * @returns Página con formulario de registro optimizado para móvil
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Container principal - Mobile first */}
      <div className="flex min-h-screen flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          {/* Header - Responsive */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
              Únete a nosotros
            </h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 sm:mt-4 sm:text-base">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>

          {/* Formulario - Mobile optimized */}
          <div className="mt-8 sm:mt-10">
            <RegisterForm />
          </div>

          {/* Términos y condiciones - Mobile friendly */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              Al crear una cuenta, aceptas nuestros{' '}
              <Link
                href="/terms"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                términos de servicio
              </Link>{' '}
              y{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                política de privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}