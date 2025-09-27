import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para manejo de autenticación
 *
 * @returns Objeto con estado y funciones de autenticación
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        setState(prev => ({
          ...prev,
          user: session?.user || null,
          loading: false,
          error: null
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Error al obtener sesión',
          loading: false
        }));
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user || null,
          loading: false,
          error: null
        }));

        // Manejar eventos específicos
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        } else if (event === 'SIGNED_IN') {
          router.push('/dashboard');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  /**
   * Inicia sesión con email y contraseña
   *
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Resultado de la operación
   */
  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('¡Bienvenido de vuelta!');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Registra un nuevo usuario
   *
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param metadata - Datos adicionales del usuario
   * @returns Resultado de la operación
   */
  const signUp = async (
    email: string,
    password: string,
    metadata?: { name?: string }
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Cuenta creada exitosamente. Revisa tu email para confirmar.');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Cierra la sesión del usuario
   *
   * @returns Resultado de la operación
   */
  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Sesión cerrada exitosamente');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Envía email para recuperar contraseña
   *
   * @param email - Email del usuario
   * @returns Resultado de la operación
   */
  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      setState(prev => ({ ...prev, loading: false }));
      toast.success('Email de recuperación enviado');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    signIn,
    signUp,
    signOut,
    resetPassword
  };
}