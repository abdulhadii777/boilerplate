# Dynamic Permission System Usage Guide

## Overview

This system provides a flexible, database-driven permission system that works with dynamic roles. Instead of hardcoding role names, you can create any roles you want in the database and the system will automatically adapt.

## Key Features

- **Dynamic Roles**: Create any role names you want in the database
- **Permission-Based**: Check specific permissions instead of hardcoded roles
- **Flexible**: Easy to add new permissions and roles
- **Type-Safe**: Full TypeScript support
- **Reusable**: Hooks and components that work throughout your app

## Basic Usage

### 1. Using the Main Permission Hook

```tsx
import { usePermissions } from '@/shared/hooks/usePermissions';

export default function MyComponent() {
    const { 
        canInviteUsers, 
        canRemoveUsers, 
        hasAdminAccess,
        userRole,
        getRoleDisplayName 
    } = usePermissions();

    return (
        <div>
            {/* Check specific permissions */}
            {canInviteUsers() && (
                <button>Invite User</button>
            )}
            
            {/* Check role-based access */}
            {hasAdminAccess() && (
                <button>Admin Action</button>
            )}
            
            {/* Display user's role */}
            <p>Your role: {getRoleDisplayName(userRole)}</p>
        </div>
    );
}
```

### 2. Using Permission Guard Components

```tsx
import { CanInviteUsers, HasAdminAccess } from '@/shared/components/PermissionGuard';

export default function MyComponent() {
    return (
        <div>
            {/* Show content only if user can invite users */}
            <CanInviteUsers>
                <button>Invite New User</button>
            </CanInviteUsers>
            
            {/* Show content only if user has admin access */}
            <HasAdminAccess>
                <div>
                    <h3>Admin Panel</h3>
                    <button>Manage System</button>
                </div>
            </HasAdminAccess>
            
            {/* With custom fallback */}
            <CanInviteUsers fallback={<p>You don't have permission to invite users</p>}>
                <button>Invite User</button>
            </CanInviteUsers>
        </div>
    );
}
```

### 3. Using Role Checking Hooks

```tsx
import { useCurrentUserRole } from '@/shared/hooks/useRoles';

export default function MyComponent() {
    const { 
        userRole, 
        hasRole, 
        hasAnyRole, 
        getRoleDisplayName,
        isRoleAvailable 
    } = useCurrentUserRole();

    return (
        <div>
            {/* Check specific role */}
            {hasRole('content_editor') && (
                <button>Edit Content</button>
            )}
            
            {/* Check multiple roles */}
            {hasAnyRole(['moderator', 'admin', 'supervisor']) && (
                <button>Moderate Content</button>
            )}
            
            {/* Get role display name */}
            <p>Role: {getRoleDisplayName(userRole)}</p>
            
            {/* Check if role exists */}
            {isRoleAvailable('custom_role') && (
                <p>Custom role is available</p>
            )}
        </div>
    );
}
```

## Advanced Usage

### 1. Conditional Rendering Based on Multiple Permissions

```tsx
import { usePermissions } from '@/shared/hooks/usePermissions';

export default function AdvancedComponent() {
    const { can, canAny, canAll } = usePermissions();

    return (
        <div>
            {/* User must have ALL permissions */}
            {canAll(['can_invite_users', 'can_remove_users']) && (
                <div>Full User Management</div>
            )}
            
            {/* User must have ANY of the permissions */}
            {canAny(['can_view_analytics', 'can_manage_settings']) && (
                <div>Some Management Access</div>
            )}
            
            {/* Check specific permission */}
            {can('can_manage_owner') && (
                <div>Owner Management</div>
            )}
        </div>
    );
}
```

### 2. Dynamic UI Based on User Capabilities

```tsx
import { usePermissions } from '@/shared/hooks/usePermissions';

export default function DynamicUI() {
    const { 
        canInviteUsers, 
        canRemoveUsers, 
        canManageRoles,
        hasAdminAccess 
    } = usePermissions();

    // Determine what actions user can perform
    const canPerformUserAction = canInviteUsers() || canRemoveUsers();
    const canPerformManagementAction = canManageRoles() || hasAdminAccess();

    return (
        <div className={canPerformManagementAction ? 'admin-layout' : 'user-layout'}>
            <header>
                <h1>Dashboard</h1>
                {canPerformUserAction && (
                    <div className="user-actions">
                        {canInviteUsers() && <button>Invite</button>}
                        {canRemoveUsers() && <button>Remove</button>}
                    </div>
                )}
            </header>
            
            <main>
                {canPerformManagementAction ? (
                    <AdminDashboard />
                ) : (
                    <UserDashboard />
                )}
            </main>
        </div>
    );
}
```

### 3. Custom Permission Guards

```tsx
import { PermissionGuard } from '@/shared/components/PermissionGuard';

export default function CustomGuards() {
    return (
        <div>
            {/* Custom permission combination */}
            <PermissionGuard 
                permissions={['can_invite_users', 'can_remove_users']}
                requireAll={false}
            >
                <div>Can perform user actions</div>
            </PermissionGuard>
            
            {/* Custom permission combination requiring all -->
            <PermissionGuard 
                permissions={['can_manage_users', 'can_manage_roles']}
                requireAll={true}
            >
                <div>Full management access</div>
            </PermissionGuard>
            
            {/* Custom fallback */}
            <PermissionGuard 
                permission="can_manage_settings"
                fallback={<p>Contact an administrator for settings access</p>}
            >
                <SettingsPanel />
            </PermissionGuard>
        </div>
    );
}
```

## Database Setup

### 1. Create Custom Roles

```php
// In your seeder or migration
$customRoles = [
    'content_editor' => [
        'display_name' => 'Content Editor',
        'description' => 'Can edit and publish content',
        'permissions' => ['view_content', 'edit_content', 'publish_content']
    ],
    'moderator' => [
        'display_name' => 'Moderator',
        'description' => 'Can moderate user content',
        'permissions' => ['view_content', 'moderate_content', 'ban_users']
    ],
    'analyst' => [
        'display_name' => 'Data Analyst',
        'description' => 'Can view analytics and reports',
        'permissions' => ['view_analytics', 'export_data', 'view_reports']
    ]
];

foreach ($customRoles as $roleName => $roleData) {
    $role = TenantRole::firstOrCreate([
        'name' => $roleName,
        'guard_name' => 'web',
    ], [
        'display_name' => $roleData['display_name'],
        'description' => $roleData['description'],
    ]);

    // Assign permissions
    $permissionIds = TenantPermission::whereIn('name', $roleData['permissions'])
        ->pluck('id')
        ->toArray();
    
    $role->permissions()->sync($permissionIds);
}
```

### 2. Create Custom Permissions

```php
// Add new permissions to your seeder
$customPermissions = [
    'view_content',
    'edit_content',
    'publish_content',
    'moderate_content',
    'ban_users',
    'export_data',
    'view_reports',
    'manage_workflows',
    'approve_changes'
];

foreach ($customPermissions as $permission) {
    TenantPermission::firstOrCreate([
        'name' => $permission,
        'guard_name' => 'web',
    ]);
}
```

## Best Practices

### 1. Permission Naming

- Use descriptive, action-based names: `edit_content`, `moderate_users`
- Group related permissions: `manage_content` includes `create_content`, `edit_content`, `delete_content`
- Use consistent naming conventions: `can_` prefix for boolean permissions

### 2. Role Design

- Keep roles focused on specific responsibilities
- Avoid creating too many roles (aim for 5-10 main roles)
- Use permission inheritance for role hierarchies
- Make role names human-readable

### 3. Frontend Usage

- Use permission guards for conditional rendering
- Check permissions at component level, not just route level
- Provide meaningful fallbacks when permissions are denied
- Use hooks for complex permission logic

### 4. Backend Security

- Always validate permissions on the server side
- Use FormRequest classes for permission checking
- Log permission checks for audit trails
- Cache permission results when possible

## Migration from Hardcoded Roles

If you're migrating from a hardcoded role system:

### 1. Update Your Database

```php
// Add new permissions
$newPermissions = [
    'can_edit_content',
    'can_moderate_users',
    'can_view_analytics'
];

// Update existing roles with new permissions
$editorRole = TenantRole::where('name', 'editor')->first();
$editorRole->permissions()->attach(
    TenantPermission::whereIn('name', ['can_edit_content', 'can_view_analytics'])->pluck('id')
);
```

### 2. Update Your Frontend

```tsx
// Before (hardcoded)
{userRole === 'admin' && <AdminPanel />}

// After (permission-based)
{can('can_manage_system') && <AdminPanel />}
```

### 3. Update Your Backend

```php
// Before (hardcoded)
if ($user->role === 'admin') {
    // Allow action
}

// After (permission-based)
if ($permissionService->userHasPermission($user->id, $tenantId, 'can_manage_system')) {
    // Allow action
}
```

## Troubleshooting

### Common Issues

1. **Permission Not Found**: Check if permission exists in database
2. **Role Not Found**: Verify role name matches exactly
3. **Frontend Not Updating**: Clear browser cache and rebuild
4. **TypeScript Errors**: Ensure types match between frontend and backend

### Debug Commands

```bash
# Check tenant permissions
php artisan tenant:artisan --tenant={tenant_id} tinker --execute="echo 'Permissions: '; \App\Models\TenantPermission::all()->pluck('name')->toArray();"

# Check tenant roles
php artisan tenant:artisan --tenant={tenant_id} tinker --execute="echo 'Roles: '; \App\Models\TenantRole::all()->pluck('name')->toArray();"

# Check user permissions
php artisan tenant:artisan --tenant={tenant_id} tinker --execute="echo 'User Permissions: '; \App\Services\PermissionService::getUserPermissions(1, '{tenant_id}')->pluck('name')->toArray();"
```

## Conclusion

This dynamic permission system gives you the flexibility to create any roles and permissions you need while maintaining type safety and ease of use. The system automatically adapts to your database configuration, making it easy to customize and extend as your application grows.
