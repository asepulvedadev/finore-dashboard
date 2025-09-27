import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type SupabaseResponse<T> = {
  data: T | null;
  error: any;
};

export abstract class BaseService<T = Record<string, any>> {
  protected client: SupabaseClient<Database>;
  protected tableName: string;

  constructor(client: SupabaseClient<Database>, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * Obtiene todos los registros de la tabla
   *
   * @param options - Opciones de consulta
   * @returns Promise con array de registros
   */
  async findAll(options?: {
    select?: string;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  }): Promise<SupabaseResponse<T[]>> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(options?.select || '*');

      if (options?.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending ?? true
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const result = await query;
      return { data: result.data as T[], error: result.error };
    } catch (error) {
      console.error(`Error al obtener registros de ${this.tableName}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Obtiene un registro por ID
   *
   * @param id - ID del registro
   * @param select - Campos a seleccionar
   * @returns Promise con el registro encontrado
   */
  async findById(id: string, select?: string): Promise<SupabaseResponse<T>> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select(select || '*')
        .eq('id', id)
        .single();

      return { data: data as T, error };
    } catch (error) {
      console.error(`Error al obtener registro ${id} de ${this.tableName}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Crea un nuevo registro
   *
   * @param data - Datos para crear el registro
   * @returns Promise con el registro creado
   */
  async create(data: Partial<T>): Promise<SupabaseResponse<T>> {
    try {
      const { data: createdData, error } = await this.client
        .from(this.tableName)
        .insert(data as any)
        .select()
        .single();

      return { data: createdData as T, error };
    } catch (error) {
      console.error(`Error al crear registro en ${this.tableName}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Actualiza un registro por ID
   *
   * @param id - ID del registro
   * @param data - Datos para actualizar
   * @returns Promise con el registro actualizado
   */
  async update(id: string, data: Partial<T>): Promise<SupabaseResponse<T>> {
    try {
      const { data: updatedData, error } = await (this.client as any)
        .from(this.tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      return { data: updatedData as T, error };
    } catch (error) {
      console.error(`Error al actualizar registro ${id} en ${this.tableName}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Elimina un registro por ID
   *
   * @param id - ID del registro a eliminar
   * @returns Promise con resultado de la operación
   */
  async delete(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      return { success: !error, error };
    } catch (error) {
      console.error(`Error al eliminar registro ${id} de ${this.tableName}:`, error);
      return { success: false, error };
    }
  }
}