

# Codigo de Investigador Opcional + Superadmin con Cambio de Rol

## 1. Hacer "Codigo de Investigador" opcional en el registro

**Archivo: `src/pages/Auth.tsx`**
- Quitar el atributo `required` del campo "Codigo de Investigador" (linea 790)
- Agregar texto "(opcional)" a la etiqueta del campo
- No se necesitan cambios en el backend ya que `researcher_code` ya es nullable en la tabla `profiles`

## 2. Sistema de Superadmin con cambio de rol

### Concepto
El usuario `christian.caicedo@unesum.edu.ec` tendra un rol especial "superadmin" que le permite:
- Ver siempre el menu de administrador
- Cambiar su vista activa entre "admin" y "student" con un click desde el sidebar
- El rol superadmin nunca se pierde, solo cambia la vista/experiencia
- Se diferencia visualmente con un color dorado/ambar

### Migracion de base de datos
- Agregar `superadmin` al enum `app_role`
- Actualizar el rol de `christian.caicedo@unesum.edu.ec` de `student` a `superadmin`

### Cambios en archivos

**Archivo: `src/hooks/useUserRole.tsx`**
- Agregar estado local `activeRole` que permite al superadmin alternar entre "admin" y "student"
- Exponer funcion `switchRole()` y `activeRole` junto con el `role` real
- Si el rol es `superadmin`, el `activeRole` por defecto es "admin"

**Archivo: `src/components/layout/AppSidebar.tsx`**
- Agregar un boton de cambio de rol en el header del sidebar (solo visible para superadmin)
- El boton mostrara "Vista Admin" o "Vista Estudiante" con un toggle animado
- Usar color dorado/ambar para diferenciar al superadmin (borde dorado en el logo, badge dorado)
- Mostrar el menu correspondiente segun el `activeRole`

**Archivo: `src/components/ProtectedRoute.tsx`**
- Tratar `superadmin` como equivalente a `admin` para bypass de aprobacion y acceso a rutas admin
- Cuando el activeRole es "student", permitir acceso a rutas de usuario normal

**Archivo: `src/pages/admin/UserDirectory.tsx`**
- Mostrar badge especial dorado para el usuario superadmin en el listado

### Detalles tecnicos

Nuevo hook `useUserRole` retornara:
```text
{
  role: "superadmin" | "admin" | "researcher" | "student",
  activeRole: "admin" | "student",  // solo relevante para superadmin
  isSuperAdmin: boolean,
  switchRole: () => void,           // alterna entre admin/student
}
```

SQL de migracion:
```text
ALTER TYPE app_role ADD VALUE 'superadmin';
-- Luego actualizar el rol del usuario especifico
UPDATE user_roles SET role = 'superadmin' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'christian.caicedo@unesum.edu.ec');
```

### Diferenciacion visual del superadmin
- Color dorado (#F59E0B / amber-500) para badges y bordes
- Icono de corona o escudo junto al nombre en el sidebar
- Badge "Super Admin" dorado en el directorio de usuarios
- El boton de cambio de rol usa un switch con colores verde (admin) y azul (estudiante)

