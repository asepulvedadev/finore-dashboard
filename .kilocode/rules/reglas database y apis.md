# reglas database y apis.md

reglas para este proyecto apis y database

## Directrices

# Reglas para Manejo de APIs y Base de Datos con Supabase

## 1. Configuración Inicial de Supabase

### Variables de Entorno
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # Solo para Server Actions
```

### Configuración del Cliente
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

/**
 * Cliente de Supabase para componentes del lado del cliente
 * 
 * @returns Cliente configurado para componentes React
 */
export function createClient() {
  return createClientComponentClient<Database>();
}
```

```typescript
// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

/**
 * Cliente de Supabase para Server Components
 * 
 * @returns Cliente configurado para server components
 */
export function createServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}

/**
 * Cliente de Supabase para Route Handlers (API Routes)
 * 
 * @returns Cliente configurado para route handlers
 */
export function createRouteHandlerClient() {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore });
}

/**
 * Cliente de Supabase para Server Actions
 * 
 * @returns Cliente configurado para server actions
 */
export function createServerActionClient() {
  const cookieStore = cookies();
  return createServerActionClient<Database>({ cookies: () => cookieStore });
}
```

## 2. Tipos de Base de Datos

### Generación de Tipos TypeScript
```bash
# Generar tipos desde Supabase CLI
npx supabase gen types typescript --project-id "your-project-id" --schema public > types/supabase.ts
```

### Estructura de Tipos
```typescript
// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          published?: boolean
          updated_at?: string
        }
      }
    }
  }
}
```

### Tipos Auxiliares
```typescript
// types/database.ts
import { Database } from './supabase';

// Tipos de tablas
export type UserType = Database['public']['Tables']['users']['Row'];
export type PostType = Database['public']['Tables']['posts']['Row'];

// Tipos para inserción
export type InsertUserType = Database['public']['Tables']['users']['Insert'];
export type InsertPostType = Database['public']['Tables']['posts']['Insert'];

// Tipos para actualización
export type UpdateUserType = Database['public']['Tables']['users']['Update'];
export type UpdatePostType = Database['public']['Tables']['posts']['Update'];

// Tipos con relaciones
export type PostWithUser = PostType & {
  user: Pick<UserType, 'id' | 'name' | 'avatar_url'>;
};
```

## 3. Servicios de Base de Datos

### Servicio Base Abstracto
```typescript
// lib/services/BaseService.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export abstract class BaseService<T = any> {
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
  }): Promise<{ data: T[] | null; error: any }> {
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
  async findById(id: string, select?: string): Promise<{ data: T | null; error: any }> {
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
  async create(data: Partial<T>): Promise<{ data: T | null; error: any }> {
    try {
      const { data: createdData, error } = await this.client
        .from(this.tableName)
        .insert(data)
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
  async update(id: string, data: Partial<T>): Promise<{ data: T | null; error: any }> {
    try {
      const { data: updatedData, error } = await this.client
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
```

### Servicio de Usuarios
```typescript
// lib/services/UserService.ts
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
      const { data, error } = await this.client
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

  /**
   * Obtiene usuarios activos con paginación
   * 
   * @param page - Número de página
   * @param limit - Registros por página
   * @returns Promise con usuarios paginados
   */
  async getActiveUsers(page: number = 1, limit: number = 20): Promise<{
    data: UserType[] | null;
    error: any;
    count: number | null;
  }> {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.client
        .from('users')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data, error, count };
    } catch (error) {
      console.error('Error al obtener usuarios activos:', error);
      return { data: null, error, count: null };
    }
  }
}
```

### Servicio de Posts
```typescript
// lib/services/PostService.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { PostType, InsertPostType, PostWithUser } from '@/types/database';
import { Database } from '@/types/supabase';

export class PostService extends BaseService<PostType> {
  constructor(client: SupabaseClient<Database>) {
    super(client, 'posts');
  }

  /**
   * Obtiene posts publicados con información del autor
   * 
   * @param limit - Número de posts a obtener
   * @returns Promise con posts y datos del usuario
   */
  async getPublishedPosts(limit?: number): Promise<{ data: PostWithUser[] | null; error: any }> {
    try {
      let query = this.client
        .from('posts')
        .select(`
          *,
          user:users (
            id,
            name,
            avatar_url
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      return { data: data as PostWithUser[], error };
    } catch (error) {
      console.error('Error al obtener posts publicados:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtiene posts de un usuario específico
   * 
   * @param userId - ID del usuario
   * @param includeUnpublished - Incluir posts no publicados
   * @returns Promise con posts del usuario
   */
  async getUserPosts(
    userId: string, 
    includeUnpublished: boolean = false
  ): Promise<{ data: PostType[] | null; error: any }> {
    try {
      let query = this.client
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!includeUnpublished) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error(`Error al obtener posts del usuario ${userId}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Busca posts por título o contenido
   * 
   * @param searchTerm - Término de búsqueda
   * @param limit - Número máximo de resultados
   * @returns Promise con posts encontrados
   */
  async searchPosts(searchTerm: string, limit: number = 20): Promise<{ data: PostWithUser[] | null; error: any }> {
    try {
      const { data, error } = await this.client
        .from('posts')
        .select(`
          *,
          user:users (
            id,
            name,
            avatar_url
          )
        `)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: data as PostWithUser[], error };
    } catch (error) {
      console.error('Error al buscar posts:', error);
      return { data: null, error };
    }
  }

  /**
   * Crea un nuevo post
   * 
   * @param postData - Datos del post
   * @returns Promise con post creado
   */
  async createPost(postData: InsertPostType): Promise<{ data: PostType | null; error: any }> {
    return this.create(postData);
  }

  /**
   * Publica o despublica un post
   * 
   * @param id - ID del post
   * @param published - Estado de publicación
   * @returns Promise con post actualizado
   */
  async togglePublished(id: string, published: boolean): Promise<{ data: PostType | null; error: any }> {
    return this.update(id, { published });
  }
}
```

## 4. Server Actions

### Configuración Base
```typescript
// lib/actions/base.ts
import { createServerActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Tipo para el resultado de las Server Actions
 */
export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
};

/**
 * Wrapper para manejar errores en Server Actions
 * 
 * @param action - Función de la Server Action
 * @returns Función wrapped con manejo de errores
 */
export function withErrorHandling<T extends any[], R>(
  action: (...args: T) => Promise<ActionResult<R>>
) {
  return async (...args: T): Promise<ActionResult<R>> => {
    try {
      return await action(...args);
    } catch (error) {
      console.error('Error en Server Action:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };
}

/**
 * Valida que el usuario esté autenticado
 * 
 * @returns Usuario autenticado o null
 */
export async function requireAuth() {
  const supabase = createServerActionClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('No autorizado. Debes iniciar sesión.');
  }
  
  return user;
}
```

### Server Actions para Posts
```typescript
// lib/actions/posts.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerActionClient } from '@/lib/supabase/server';
import { PostService } from '@/lib/services/PostService';
import { withErrorHandling, requireAuth, ActionResult } from './base';
import { InsertPostType, UpdatePostType } from '@/types/database';
import { z } from 'zod';

// Schema de validación para posts
const createPostSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título es muy largo'),
  content: z.string().min(1, 'El contenido es requerido'),
  published: z.boolean().default(false)
});

const updatePostSchema = createPostSchema.partial();

/**
 * Server Action para crear un nuevo post
 * 
 * @param formData - Datos del formulario
 * @returns Resultado de la operación
 */
export const createPost = withErrorHandling(async (formData: FormData): Promise<ActionResult> => {
  // Validar autenticación
  const user = await requireAuth();
  
  // Extraer y validar datos
  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    published: formData.get('published') === 'true'
  };
  
  const validatedData = createPostSchema.safeParse(rawData);
  
  if (!validatedData.success) {
    return {
      success: false,
      error: 'Datos inválidos',
      validationErrors: validatedData.error.flatten().fieldErrors
    };
  }
  
  // Crear post
  const supabase = createServerActionClient();
  const postService = new PostService(supabase);
  
  const postData: InsertPostType = {
    ...validatedData.data,
    user_id: user.id
  };
  
  const { data: post, error } = await postService.createPost(postData);
  
  if (error) {
    return {
      success: false,
      error: 'Error al crear el post'
    };
  }
  
  // Revalidar cache y redirigir
  revalidatePath('/dashboard/posts');
  revalidatePath('/posts');
  
  return {
    success: true,
    data: post
  };
});

/**
 * Server Action para actualizar un post
 * 
 * @param id - ID del post
 * @param formData - Datos del formulario
 * @returns Resultado de la operación
 */
export const updatePost = withErrorHandling(async (id: string, formData: FormData): Promise<ActionResult> => {
  // Validar autenticación
  const user = await requireAuth();
  
  // Validar datos
  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    published: formData.get('published') === 'true'
  };
  
  const validatedData = updatePostSchema.safeParse(rawData);
  
  if (!validatedData.success) {
    return {
      success: false,
      error: 'Datos inválidos',
      validationErrors: validatedData.error.flatten().fieldErrors
    };
  }
  
  // Verificar propiedad del post
  const supabase = createServerActionClient();
  const postService = new PostService(supabase);
  
  const { data: existingPost } = await postService.findById(id);
  
  if (!existingPost || existingPost.user_id !== user.id) {
    return {
      success: false,
      error: 'No tienes permisos para editar este post'
    };
  }
  
  // Actualizar post
  const { data: post, error } = await postService.update(id, validatedData.data);
  
  if (error) {
    return {
      success: false,
      error: 'Error al actualizar el post'
    };
  }
  
  // Revalidar cache
  revalidatePath('/dashboard/posts');
  revalidatePath('/posts');
  revalidatePath(`/posts/${id}`);
  
  return {
    success: true,
    data: post
  };
});

/**
 * Server Action para eliminar un post
 * 
 * @param id - ID del post a eliminar
 * @returns Resultado de la operación
 */
export const deletePost = withErrorHandling(async (id: string): Promise<ActionResult> => {
  // Validar autenticación
  const user = await requireAuth();
  
  const supabase = createServerActionClient();
  const postService = new PostService(supabase);
  
  // Verificar propiedad del post
  const { data: existingPost } = await postService.findById(id);
  
  if (!existingPost || existingPost.user_id !== user.id) {
    return {
      success: false,
      error: 'No tienes permisos para eliminar este post'
    };
  }
  
  // Eliminar post
  const { success, error } = await postService.delete(id);
  
  if (!success) {
    return {
      success: false,
      error: 'Error al eliminar el post'
    };
  }
  
  // Revalidar cache y redirigir
  revalidatePath('/dashboard/posts');
  revalidatePath('/posts');
  
  return { success: true };
});

/**
 * Server Action para cambiar el estado de publicación
 * 
 * @param id - ID del post
 * @param published - Nuevo estado de publicación
 * @returns Resultado de la operación
 */
export const togglePostPublished = withErrorHandling(async (
  id: string, 
  published: boolean
): Promise<ActionResult> => {
  // Validar autenticación
  const user = await requireAuth();
  
  const supabase = createServerActionClient();
  const postService = new PostService(supabase);
  
  // Verificar propiedad del post
  const { data: existingPost } = await postService.findById(id);
  
  if (!existingPost || existingPost.user_id !== user.id) {
    return {
      success: false,
      error: 'No tienes permisos para modificar este post'
    };
  }
  
  // Cambiar estado
  const { data: post, error } = await postService.togglePublished(id, published);
  
  if (error) {
    return {
      success: false,
      error: 'Error al cambiar el estado del post'
    };
  }
  
  // Revalidar cache
  revalidatePath('/dashboard/posts');
  revalidatePath('/posts');
  
  return {
    success: true,
    data: post
  };
});
```

## 5. React Query / TanStack Query para Cliente

### Configuración de React Query
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración global de React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Mantener cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Reintentar una vez en caso de error
      retry: 1,
      // No refetch automático en focus/mount a menos que sea necesario
      refetchOnWindowFocus: false,
      refetchOnMount: true
    },
    mutations: {
      // Reintentar mutaciones fallidas una vez
      retry: 1
    }
  }
});

// Wrapper del provider
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Hooks de Consulta
```typescript
// hooks/usePostsQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PostService } from '@/lib/services/PostService';
import { PostType, PostWithUser } from '@/types/database';
import { toast } from 'sonner';

const postService = new PostService(createClient());

/**
 * Query key factory para posts
 */
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  search: (term: string) => [...postKeys.all, 'search', term] as const
};

/**
 * Hook para obtener posts publicados
 * 
 * @param limit - Número de posts a obtener
 * @returns Query con posts publicados
 */
export function usePublishedPosts(limit?: number) {
  return useQuery({
    queryKey: postKeys.list({ published: true, limit }),
    queryFn: async (): Promise<PostWithUser[]> => {
      const { data, error } = await postService.getPublishedPosts(limit);
      
      if (error) {
        throw new Error('Error al obtener posts');
      }
      
      return data || [];
    },
    staleTime: 2 * 60 * 1000 // 2 minutos para posts publicados
  });
}

/**
 * Hook para obtener un post por ID
 * 
 * @param id - ID del post
 * @returns Query con datos del post
 */
export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: async (): Promise<PostType> => {
      const { data, error } = await postService.findById(id);
      
      if (error || !data) {
        throw new Error('Post no encontrado');
      }
      
      return data;
    },
    enabled: !!id // Solo ejecutar si hay ID
  });
}

/**
 * Hook para buscar posts
 * 
 * @param searchTerm - Término de búsqueda
 * @param enabled - Si la búsqueda está habilitada
 * @returns Query con resultados de búsqueda
 */
export function useSearchPosts(searchTerm: string, enabled: boolean = true) {
  return useQuery({
    queryKey: postKeys.search(searchTerm),
    queryFn: async (): Promise<PostWithUser[]> => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await postService.searchPosts(searchTerm);
      
      if (error) {
        throw new Error('Error al buscar posts');
      }
      
      return data || [];
    },
    enabled: enabled && searchTerm.trim().length > 0,
    staleTime: 30 * 1000 // 30 segundos para búsquedas
  });
}

/**
 * Hook para crear un post (mutación)
 * 
 * @returns Mutación para crear post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postData: { title: string; content: string; published: boolean }) => {
      const { data, error } = await postService.createPost({
        title: postData.title,
        content: postData.content,
        published: postData.published,
        user_id: '' // Se obtiene del contexto de auth
      });
      
      if (error || !data) {
        throw new Error('Error al crear el post');
      }
      
      return data;
    },
    onSuccess: (newPost) => {
      // Invalidar y actualizar queries relacionadas
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      // Mostrar notificación de éxito
      toast.success('Post creado exitosamente');
    },
    onError: (error) => {
      // Mostrar notificación de error
      toast.error(error.message || 'Error al crear el post');
    }
  });
}

/**
 * Hook para actualizar un post (mutación)
 * 
 * @returns Mutación para actualizar post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PostType> }) => {
      const { data, error } = await postService.update(id, updates);
      
      if (error || !data) {
        throw new Error('Error al actualizar el post');
      }
      
      return data;
    },
    onSuccess: (updatedPost) => {
      // Actualizar cache del post específico
      queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);
      
      // Invalidar listas relacionadas
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      toast.success('Post actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el post');
    }
  });
}

/**
 * Hook para eliminar un post (mutación)
 * 
 * @returns Mutación para eliminar post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { success, error } = await postService.delete(id);
      
      if (!success) {
        throw new Error('Error al eliminar el post');
      }
      
      return id;
    },
    onSuccess: (deletedId) => {
      // Remover del cache
      queryClient.removeQueries({ queryKey: postKeys.detail(deletedId) });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      toast.success('Post eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el post');
    }
  });
}
```

## 6. Autenticación con Supabase

### Hook de Autenticación
```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para manejo de autenticación
 * 
 * @returns Estado y funciones de autenticación
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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }));
          return;
        }
        
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
  }, [router]);
  
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
```

### Middleware de Autenticación
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/supabase';

/**
 * Middleware para manejar autenticación en rutas protegidas
 * 
 * @param req - Request de Next.js
 * @returns Response con redirección si es necesario
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  
  // Obtener sesión actual
  const { data: { session }, error } = await supabase.auth.getSession();
  
  const { pathname } = req.nextUrl;
  
  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/profile', '/settings'];
  
  // Rutas de autenticación (solo para usuarios no autenticados)
  const authRoutes = ['/login', '/register', '/forgot-password'];
  
  // Verificar si la ruta actual está protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar si es una ruta de autenticación
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Si no hay sesión y está intentando acceder a ruta protegida
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Si hay sesión y está intentando acceder a rutas de auth
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

## 7. Políticas de Seguridad RLS (Row Level Security)

### Configuración de RLS para Usuarios
```sql
-- Habilitar RLS en tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver su propio perfil
CREATE POLICY "usuarios_pueden_ver_su_perfil" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "usuarios_pueden_actualizar_su_perfil" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Política para insertar nuevos usuarios (registro)
CREATE POLICY "permitir_insercion_usuarios" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Configuración de RLS para Posts
```sql
-- Habilitar RLS en tabla posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Política para ver posts publicados (público)
CREATE POLICY "ver_posts_publicados" ON posts
  FOR SELECT
  USING (published = true);

-- Política para que los usuarios vean sus propios posts
CREATE POLICY "usuarios_ven_sus_posts" ON posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para crear posts (solo usuarios autenticados)
CREATE POLICY "usuarios_pueden_crear_posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para actualizar posts propios
CREATE POLICY "usuarios_pueden_actualizar_sus_posts" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para eliminar posts propios
CREATE POLICY "usuarios_pueden_eliminar_sus_posts" ON posts
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 8. Manejo de Errores y Validaciones

### Wrapper para Manejo de Errores de Supabase
```typescript
// lib/utils/errorHandler.ts

export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * Procesa errores de Supabase y devuelve mensajes amigables
 * 
 * @param error - Error de Supabase
 * @returns Mensaje de error procesado
 */
export function handleSupabaseError(error: any): string {
  if (!error) return 'Error desconocido';
  
  // Errores de autenticación
  if (error.message?.includes('Invalid login credentials')) {
    return 'Credenciales inválidas. Verifica tu email y contraseña.';
  }
  
  if (error.message?.includes('Email not confirmed')) {
    return 'Por favor confirma tu email antes de iniciar sesión.';
  }
  
  if (error.message?.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  
  // Errores de base de datos
  if (error.code === '23505') {
    return 'Ya existe un registro con estos datos.';
  }
  
  if (error.code === '23503') {
    return 'No se puede eliminar este registro porque está siendo usado.';
  }
  
  if (error.code === '23502') {
    return 'Faltan campos requeridos.';
  }
  
  // Errores de permisos
  if (error.message?.includes('row-level security')) {
    return 'No tienes permisos para realizar esta acción.';
  }
  
  // Error genérico
  return error.message || 'Ha ocurrido un error inesperado.';
}

/**
 * Wrapper para ejecutar operaciones de Supabase con manejo de errores
 * 
 * @param operation - Función que devuelve una promesa de Supabase
 * @returns Resultado con manejo de errores mejorado
 */
export async function withErrorHandling<T>(
  operation: () => Promise<{ data: T; error: any }>
): Promise<{ data: T | null; error: string | null; success: boolean }> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      const friendlyError = handleSupabaseError(error);
      return { data: null, error: friendlyError, success: false };
    }
    
    return { data, error: null, success: true };
  } catch (error) {
    const friendlyError = handleSupabaseError(error);
    return { data: null, error: friendlyError, success: false };
  }
}
```

### Validación con Zod
```typescript
// lib/validations/schemas.ts
import { z } from 'zod';

/**
 * Schema de validación para usuarios
 */
export const userSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  email: z.string()
    .email('Formato de email inválido')
    .min(1, 'El email es requerido'),
  avatar_url: z.string().url('URL inválida').optional()
});

/**
 * Schema de validación para posts
 */
export const postSchema = z.object({
  title: z.string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  content: z.string()
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(10000, 'El contenido no puede exceder 10,000 caracteres'),
  published: z.boolean().default(false)
});

/**
 * Schema de validación para autenticación
 */
export const authSchema = {
  signIn: z.object({
    email: z.string().email('Formato de email inválido'),
    password: z.string().min(1, 'La contraseña es requerida')
  }),
  
  signUp: z.object({
    email: z.string().email('Formato de email inválido'),
    password: z.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
      .regex(/[0-9]/, 'Debe incluir al menos un número'),
    name: z.string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
  }),
  
  resetPassword: z.object({
    email: z.string().email('Formato de email inválido')
  })
};

/**
 * Función helper para validar datos con esquemas
 * 
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Resultado de validación
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.flatten().fieldErrors;
  return { success: false, errors };
}
```

## 9. Optimizaciones y Mejores Prácticas

### Cache y Memoización
```typescript
// lib/utils/cache.ts
import { unstable_cache } from 'next/cache';

/**
 * Cache para consultas de Server Components
 * Usar con moderación y solo para datos que cambian poco
 */
export const getCachedPosts = unstable_cache(
  async () => {
    const { createServerClient } = await import('@/lib/supabase/server');
    const { PostService } = await import('@/lib/services/PostService');
    
    const supabase = createServerClient();
    const postService = new PostService(supabase);
    
    const { data } = await postService.getPublishedPosts();
    return data || [];
  },
  ['published-posts'],
  {
    revalidate: 60 * 5, // 5 minutos
    tags: ['posts', 'published']
  }
);

/**
 * Revalidar cache manualmente
 */
export async function revalidatePosts() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('posts');
}
```

### Paginación Optimizada
```typescript
// hooks/usePaginatedQuery.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface PaginationOptions {
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Hook para paginación infinita con Supabase
 * 
 * @param tableName - Nombre de la tabla
 * @param options - Opciones de paginación
 * @returns Query con paginación infinita
 */
export function usePaginatedQuery<T>(
  tableName: string,
  options: PaginationOptions = {}
) {
  const { pageSize = 20, enabled = true } = options;
  const supabase = createClient();
  
  return useInfiniteQuery({
    queryKey: [tableName, 'paginated', pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Error al obtener datos: ${error.message}`);
      }
      
      return {
        data: data as T[],
        nextCursor: (from + pageSize < (count || 0)) ? pageParam + 1 : null,
        hasMore: from + pageSize < (count || 0)
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled
  });
}
```

## 10. Testing con Supabase

### Configuración de Tests
```typescript
// lib/testing/supabase-mock.ts
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente mock de Supabase para testing
 */
export function createMockClient() {
  const mockClient = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        })),
        order: jest.fn(() => ({
          limit: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn()
      }))
    })),
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn()
    }
  };
  
  return mockClient;
}
```

### Test de Servicios
```typescript
// __tests__/services/PostService.test.ts
import { PostService } from '@/lib/services/PostService';
import { createMockClient } from '@/lib/testing/supabase-mock';

describe('PostService', () => {
  let postService: PostService;
  let mockClient: any;
  
  beforeEach(() => {
    mockClient = createMockClient();
    postService = new PostService(mockClient);
  });
  
  describe('getPublishedPosts', () => {
    it('debe obtener posts publicados correctamente', async () => {
      // Arrange
      const mockPosts = [
        { id: '1', title: 'Post 1', published: true },
        { id: '2', title: 'Post 2', published: true }
      ];
      
      mockClient.from().select().eq().order.mockResolvedValue({
        data: mockPosts,
        error: null
      });
      
      // Act
      const result = await postService.getPublishedPosts();
      
      // Assert
      expect(result.data).toEqual(mockPosts);
      expect(result.error).toBeNull();
      expect(mockClient.from).toHaveBeenCalledWith('posts');
    });
    
    it('debe manejar errores correctamente', async () => {
      // Arrange
      const mockError = new Error('Database error');
      mockClient.from().select().eq().order.mockRejectedValue(mockError);
      
      // Act
      const result = await postService.getPublishedPosts();
      
      // Assert
      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
    });
  });
});
```

---

## 📋 Checklist de Mejores Prácticas

### Antes de hacer queries:
- [ ] ¿Los tipos están correctamente definidos?
- [ ] ¿Se está usando el cliente correcto (server/client)?
- [ ] ¿Las políticas RLS están configuradas?
- [ ] ¿Se está manejando correctamente los errores?

### Antes de implementar mutaciones:
- [ ] ¿Se está validando los datos con Zod?
- [ ] ¿Se está usando Server Actions cuando es apropiado?
- [ ] ¿Se está revalidando el cache correctamente?
- [ ] ¿Se está mostrando feedback al usuario?

### Antes de desplegar:
- [ ] ¿Las variables de entorno están configuradas?
- [ ] ¿Las migraciones de DB están aplicadas?
- [ ] ¿Las políticas RLS están funcionando correctamente?
- [ ] ¿Se han probado todos los flujos de autenticación?

### Seguridad:
- [ ] ¿RLS está habilitado en todas las tablas?
- [ ] ¿Las políticas cubren todos los casos de uso?
- [ ] ¿No se está exponiendo información sensible en el cliente?
- [ ] ¿Se está usando HTTPS en producción?
