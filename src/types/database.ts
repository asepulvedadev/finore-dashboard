import { Database } from './supabase';

// Tipos de tablas
export type UserType = Database['public']['Tables']['users']['Row'];

// Tipos para inserción
export type InsertUserType = Database['public']['Tables']['users']['Insert'];

// Tipos para actualización
export type UpdateUserType = Database['public']['Tables']['users']['Update'];