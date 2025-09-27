import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { UserType, InsertUserType, UpdateUserType } from '@/types/database';
import { Database } from '@/types/supabase';

export class UserService extends BaseService<UserType> {
  constructor(client: SupabaseClient<Database>) {
    super(client, 'users');
  }

  /**
   * Obtiene un usuario por email
   *
   * @param email - Email del usuario
   * @returns Promise con datos del usuario
   */
  async findByEmail(email: string): Promise<{ data: UserType | null; error: any }> {
    try {
      const { data, error } = await (this.client as any)
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      return { data: null, error };
    }
  }

  /**
   * Crea un nuevo usuario
   *
   * @param userData - Datos del usuario
   * @returns Promise con usuario creado
   */
  async createUser(userData: InsertUserType): Promise<{ data: UserType | null; error: any }> {
    return this.create(userData);
  }

  /**
   * Actualiza el perfil de un usuario
   *
   * @param id - ID del usuario
   * @param updates - Datos a actualizar
   * @returns Promise con usuario actualizado
   */
  async updateProfile(id: string, updates: UpdateUserType): Promise<{ data: UserType | null; error: any }> {
    return this.update(id, updates);
  }
}