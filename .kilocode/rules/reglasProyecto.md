# reglasProyecto.md

reglas para este proyecto Dashboard 

## Directrices

# Reglas de Desarrollo - Next.js 14 con App Router

## 1. Estructura del Proyecto

### Organización de Archivos Obligatoria
- `/src/app/` - Solo archivos de rutas y layouts de Next.js 14
- `/src/components/` - Todos los componentes React organizados por función
- `/src/lib/` - Utilerías, helpers y configuraciones
- `/src/hooks/` - Custom hooks React
- `/src/types/` - Definiciones de TypeScript
- `/src/styles/` - Archivos CSS adicionales si son necesarios

## 2. Convenciones de Nomenclatura

### Archivos y Directorios
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Páginas**: snake_case para archivos de Next.js (`page.tsx`, `layout.tsx`, `loading.tsx`)
- **Hooks**: camelCase con prefijo "use" (`useAuth.ts`)
- **Utilerías**: camelCase (`formatDate.ts`)
- **Tipos**: PascalCase con sufijo "Type" (`UserType.ts`)
- **Directorios**: kebab-case (`user-management/`)

### Variables y Funciones
- **Variables**: camelCase (`userName`, `isLoading`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Funciones**: camelCase (`handleSubmit`, `fetchUserData`)
- **Componentes**: PascalCase (`UserCard`, `LoginForm`)

## 3. Arquitectura de Componentes

### Principios Fundamentales
1. **Un componente = Una responsabilidad**
2. **Máximo 200 líneas por componente**
3. **Props tipadas con TypeScript**
4. **Separación de lógica y presentación**

### Estructura de Componente Estándar
```typescript
/**
 * Componente para mostrar información del usuario
 * 
 * @param user - Objeto con datos del usuario
 * @param onEdit - Función para editar usuario
 * @returns Componente de tarjeta de usuario
 */
interface UserCardProps {
  user: UserType;
  onEdit: (id: string) => void;
  className?: string; // Siempre opcional para Tailwind
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  // 1. Hooks al inicio
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Funciones de manejo de eventos
  const handleEdit = useCallback(() => {
    onEdit(user.id);
  }, [user.id, onEdit]);
  
  // 3. Early returns para condiciones
  if (!user) {
    return <div>Usuario no encontrado</div>;
  }
  
  // 4. Render principal
  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      {/* Contenido del componente */}
    </div>
  );
}
```

## 4. Configuración de ESLint

### Reglas Obligatorias
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always"
    }]
  }
}
```

### Orden de Importaciones Obligatorio
```typescript
// 1. Librerías de React/Next.js
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// 2. Librerías externas
import { clsx } from 'clsx';

// 3. Componentes internos
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/common/UserCard';

// 4. Hooks personalizados
import { useAuth } from '@/hooks/useAuth';

// 5. Tipos y interfaces
import type { UserType } from '@/types/UserType';

// 6. Utilerías
import { formatDate } from '@/lib/utils';
```

## 5. Mejores Prácticas con Tailwind CSS

### Uso de cn() para Clases Condicionales
```typescript
import { cn } from '@/lib/utils';

// ✅ CORRECTO: Usar cn() para combinar clases
<Button 
  className={cn(
    "bg-blue-500 hover:bg-blue-600", // Clases base
    isDisabled && "opacity-50 cursor-not-allowed", // Condicionales
    size === 'large' && "px-8 py-4", // Variantes
    className // Props externas al final
  )}
>
```

### Organización de Clases Tailwind
```typescript
// ✅ CORRECTO: Agrupar clases por categoría
<div className={cn(
  // Layout
  "flex items-center justify-between",
  // Espaciado
  "p-4 m-2",
  // Colores
  "bg-white border-gray-200",
  // Tipografía
  "text-lg font-semibold",
  // Estados
  "hover:bg-gray-50 focus:outline-none"
)}>
```

### Componentes de Variantes
```typescript
// Definir variantes usando cva (class-variance-authority)
const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white hover:bg-blue-600",
        outline: "border border-gray-300 bg-white hover:bg-gray-50",
        ghost: "hover:bg-gray-100"
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
```

## 6. Integración con Shadcn/UI

### Personalización de Componentes
```typescript
// ✅ CORRECTO: Extender componentes de shadcn/ui
import { Button as BaseButton } from '@/components/ui/button';

interface CustomButtonProps extends React.ComponentProps<typeof BaseButton> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export function CustomButton({ 
  isLoading, 
  leftIcon, 
  children, 
  disabled,
  ...props 
}: CustomButtonProps) {
  return (
    <BaseButton 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="mr-2" />}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </BaseButton>
  );
}
```

### Uso de Componentes UI
```typescript
// ✅ CORRECTO: Usar componentes base como foundation
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function UserForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Información del Usuario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Nombre completo" />
        <Button className="w-full">Guardar</Button>
      </CardContent>
    </Card>
  );
}
```

## 7. Manejo del App Router (Next.js 14)

### Estructura de Rutas
```
app/
├── layout.tsx              # Layout raíz
├── page.tsx               # Página principal (/)
├── loading.tsx            # Loading UI global
├── error.tsx              # Error UI global
├── not-found.tsx          # 404 personalizado
├── dashboard/
│   ├── layout.tsx         # Layout específico de dashboard
│   ├── page.tsx           # /dashboard
│   ├── loading.tsx        # Loading específico
│   └── users/
│       ├── page.tsx       # /dashboard/users
│       └── [id]/
│           └── page.tsx   # /dashboard/users/[id]
└── (auth)/                # Grupo de rutas
    ├── login/
    │   └── page.tsx       # /login
    └── register/
        └── page.tsx       # /register
```

### Layouts Anidados
```typescript
// app/layout.tsx - Layout raíz
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-gray-50">
          {/* Navbar global */}
          <Navbar />
          {children}
          {/* Footer global */}
          <Footer />
        </div>
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx - Layout específico
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar específico del dashboard */}
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

### Server Components vs Client Components
```typescript
// ✅ Server Component (por defecto)
// app/users/page.tsx
async function UsersPage() {
  // Fetch de datos en el servidor
  const users = await fetchUsers();
  
  return (
    <div>
      <h1>Usuarios</h1>
      <UsersList users={users} />
    </div>
  );
}

// ✅ Client Component (interactividad)
// components/UsersList.tsx
'use client';

interface UsersListProps {
  users: UserType[];
}

export function UsersList({ users }: UsersListProps) {
  const [filteredUsers, setFilteredUsers] = useState(users);
  
  const handleSearch = (query: string) => {
    // Lógica de filtrado interactiva
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };
  
  return (
    <div>
      <SearchInput onSearch={handleSearch} />
      {filteredUsers.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

## 8. Patrones de Programación Modular

### Custom Hooks
```typescript
// hooks/useAuth.ts
/**
 * Hook personalizado para manejo de autenticación
 * 
 * @returns Objeto con estado y funciones de autenticación
 */
export function useAuth() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await authService.login(email, password);
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }, []);
  
  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
}
```

### Servicios Modulares
```typescript
// lib/services/userService.ts
/**
 * Servicio para operaciones relacionadas con usuarios
 */
class UserService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  /**
   * Obtiene todos los usuarios
   * 
   * @returns Promise con array de usuarios
   */
  async getAllUsers(): Promise<UserType[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un usuario por ID
   * 
   * @param id - ID del usuario
   * @returns Promise con datos del usuario
   */
  async getUserById(id: string): Promise<UserType> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado');
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo usuario
   * 
   * @param userData - Datos del usuario a crear
   * @returns Promise con usuario creado
   */
  async createUser(userData: Omit<UserType, 'id'>): Promise<UserType> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear usuario: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const userService = new UserService();
```

### Utilidades Modulares
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind CSS eliminando duplicados
 * 
 * @param inputs - Array de clases CSS
 * @returns String con clases CSS combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una fecha en formato legible en español
 * 
 * @param date - Fecha a formatear
 * @param options - Opciones de formateo
 * @returns Fecha formateada
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('es-ES', defaultOptions);
}

/**
 * Valida formato de email
 * 
 * @param email - Email a validar
 * @returns true si el email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Trunca texto a una longitud específica
 * 
 * @param text - Texto a truncar
 * @param length - Longitud máxima
 * @returns Texto truncado
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}
```

## 9. Comentarios y Documentación

### Estándares de Comentarios
```typescript
/**
 * Componente para mostrar un formulario de login
 * 
 * Este componente maneja la autenticación del usuario mediante
 * email y contraseña, incluyendo validación y manejo de errores.
 * 
 * @example
 * ```tsx
 * <LoginForm 
 *   onSuccess={(user) => redirect('/dashboard')}
 *   onError={(error) => showNotification(error)}
 * />
 * ```
 */
interface LoginFormProps {
  /** Función ejecutada cuando el login es exitoso */
  onSuccess: (user: UserType) => void;
  /** Función ejecutada cuando hay un error */
  onError: (error: string) => void;
  /** Clases CSS adicionales */
  className?: string;
}

export function LoginForm({ onSuccess, onError, className }: LoginFormProps) {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Estado para el loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Maneja el envío del formulario
   * 
   * @param event - Evento del formulario
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validación básica
    if (!formData.email || !formData.password) {
      onError('Por favor completa todos los campos');
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      onError('Por favor ingresa un email válido');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Intento de autenticación
      const result = await authService.login(formData.email, formData.password);
      
      if (result.success) {
        onSuccess(result.user);
      } else {
        onError(result.error || 'Error desconocido');
      }
    } catch (error) {
      onError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className={cn("space-y-4", className)}
    >
      {/* Resto del componente */}
    </form>
  );
}
```

### Documentación de Tipos
```typescript
// types/UserType.ts
/**
 * Representa un usuario en el sistema
 */
export interface UserType {
  /** ID único del usuario */
  id: string;
  /** Nombre completo del usuario */
  name: string;
  /** Email único del usuario */
  email: string;
  /** URL del avatar del usuario (opcional) */
  avatar?: string;
  /** Fecha de creación de la cuenta */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
  /** Rol del usuario en el sistema */
  role: UserRole;
  /** Indica si el usuario está activo */
  isActive: boolean;
}

/**
 * Roles disponibles para usuarios
 */
export type UserRole = 'admin' | 'user' | 'moderator';

/**
 * Datos necesarios para crear un nuevo usuario
 */
export type CreateUserData = Omit<UserType, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Datos necesarios para actualizar un usuario
 */
export type UpdateUserData = Partial<Omit<UserType, 'id' | 'createdAt' | 'updatedAt'>>;
```

## 10. Configuraciones de Desarrollo

### Scripts de package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest",
    "test:watch": "jest --watch",
    "analyze": "cross-env ANALYZE=true next build"
  }
}
```

### Configuración de VSCode
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["clsx\\(([^)]*)\\)", "'([^']*)'"]
  ]
}
```

### Git Hooks con Husky
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run build"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 📝 Checklist de Desarrollo

### Antes de crear un componente:
- [ ] ¿Es reutilizable en otras partes de la app?
- [ ] ¿Tiene una sola responsabilidad clara?
- [ ] ¿Necesita estar en client component o puede ser server component?
- [ ] ¿Las props están bien tipadas?

### Antes de hacer commit:
- [ ] ¿El código pasa el linting sin errores?
- [ ] ¿Están todos los tipos definidos correctamente?
- [ ] ¿Los comentarios explican el "por qué" no solo el "qué"?
- [ ] ¿Las importaciones están organizadas correctamente?

### Antes de hacer push:
- [ ] ¿La aplicación se buildea sin errores?
- [ ] ¿Se han actualizado los tipos si es necesario?
- [ ] ¿Los componentes nuevos siguen la arquitectura establecida?