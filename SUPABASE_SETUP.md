# Configuración de Supabase - Autenticación Completa

Este documento explica cómo configurar las políticas RLS (Row Level Security) en Supabase para la autenticación implementada.

## 1. Configuración Inicial de Supabase

### Variables de Entorno
Asegúrate de configurar las siguientes variables en tu archivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Base de Datos
Ejecuta las siguientes consultas SQL en el SQL Editor de Supabase para crear la tabla de usuarios:

```sql
-- Crear tabla de usuarios (si no existe)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 2. Políticas de Seguridad RLS (Row Level Security)

### Habilitar RLS en la tabla users
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Políticas para la tabla users
```sql
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

## 3. Configuración de Autenticación en Supabase

### Configuración del Authentication
1. Ve a Authentication > Settings en tu dashboard de Supabase
2. Configura:
   - Site URL: `http://localhost:3000` (para desarrollo)
   - Redirect URLs: `http://localhost:3000/auth/callback`
3. Habilita los proveedores de autenticación que necesites (Email por defecto)

### URL de Redirección
Asegúrate de que las siguientes URLs estén permitidas en Authentication > Settings:
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/dashboard` (opcional)

## 4. Verificación de la Configuración

### Probar la Autenticación
1. Ejecuta `bun run dev`
2. Ve a `http://localhost:3000`
3. Deberías ser redirigido a `/login`
4. Registra un nuevo usuario
5. Verifica que puedas iniciar sesión
6. Confirma que puedes acceder al dashboard
7. Verifica que el middleware protege las rutas

### Verificar Políticas RLS
En el SQL Editor de Supabase, ejecuta:
```sql
-- Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## 5. Solución de Problemas

### Error: "No autorizado"
- Verifica que las políticas RLS estén correctamente configuradas
- Asegúrate de que el usuario esté autenticado

### Error: "Email no confirmado"
- Ve a Authentication > Settings y habilita "Enable email confirmations"
- O deshabilita para desarrollo local

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de usar la anon key para el cliente

### Error: "relation 'users' does not exist"
- Ejecuta las consultas SQL para crear la tabla users

## 6. Despliegue en Producción

### Variables de Entorno de Producción
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

### Configuración de Producción
1. Actualiza la Site URL en Supabase Authentication Settings
2. Agrega las URLs de producción a Redirect URLs
3. Configura las políticas RLS según tus necesidades de seguridad

## 7. Funcionalidades Implementadas

✅ Autenticación completa con Supabase
✅ Registro de usuarios
✅ Inicio de sesión
✅ Cierre de sesión
✅ Middleware para rutas protegidas
✅ Redirecciones automáticas
✅ Manejo de errores con notificaciones
✅ Tipos TypeScript completos
✅ Servicios modulares
✅ Hooks personalizados
✅ Providers de React Query
✅ Políticas RLS configuradas

## 8. Instalación PWA

### Cómo Instalar la Aplicación

La aplicación está configurada como Progressive Web App (PWA) y se puede instalar en dispositivos móviles y de escritorio.

#### En Android/Chrome:
1. Abre la aplicación en Chrome
2. Toca el menú (tres puntos) en la esquina superior derecha
3. Selecciona "Agregar a pantalla de inicio" o "Instalar aplicación"
4. Confirma la instalación

#### En iOS/Safari:
1. Abre la aplicación en Safari
2. Toca el botón compartir (cuadrado con flecha hacia arriba)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma la instalación

#### En Desktop:
1. En Chrome/Edge: Haz clic en el botón de instalación en la barra de direcciones
2. En Firefox: El botón de instalación aparecerá automáticamente
3. Sigue las instrucciones para instalar

### Características PWA

- ✅ **Instalación nativa** - Se comporta como una app nativa
- ✅ **Offline-first** - Funciona sin conexión a internet
- ✅ **Actualizaciones automáticas** - Se actualiza automáticamente
- ✅ **Notificaciones push** - Soporte preparado para futuras notificaciones
- ✅ **Cache inteligente** - Almacena recursos para carga rápida
- ✅ **Responsive** - Se adapta a cualquier tamaño de pantalla

### Verificación de Instalación

Después de instalar, verás:
- Un icono en tu pantalla de inicio
- La app se abre en modo standalone (sin barra de navegación)
- Funciona offline
- Indicador de estado PWA en la esquina superior derecha (en desarrollo)

## 9. Próximos Pasos

- Implementar recuperación de contraseña
- Agregar autenticación con proveedores sociales (Google, GitHub, etc.)
- Crear sistema de roles y permisos
- Implementar verificación de email
- Agregar más tablas y relaciones según necesites
- Configurar notificaciones push
- Implementar sincronización en segundo plano