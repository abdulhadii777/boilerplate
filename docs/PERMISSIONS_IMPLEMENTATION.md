# Dynamic Role & Permission System Implementation

## Overview

This document describes the implementation of a dynamic role and permission system using Spatie's Laravel Permission package with multi-tenancy support.

## Architecture

### Backend Components

#### 1. Models
- **TenantRole**: Extends Spatie's Role model, stored in tenant database
- **TenantPermission**: Extends Spatie's Permission model, stored in tenant database
- **User**: Central database model with tenant relationships
- **TenantUser**: Pivot table linking users to tenants with roles

#### 2. Services
- **PermissionService**: Core service for permission checking and management
- **UserService**: Handles user and invitation management

#### 3. Request Classes
- **StoreUserRequest**: Validates user invitations with permission-based authorization
- **DestroyInvitationRequest**: Handles invitation cancellation
- **DestroyUserRequest**: Handles user removal from tenants

### Frontend Components

#### 1. Types
- **TenantPermissions**: Interface defining all available permissions
- **TenantRole**: Interface for role data structure
- **UserCard**: Unified interface for users and invitations

#### 2. Components
- **UnifiedUsersGrid**: Displays users and invitations in a single grid
- **InviteUsersDialog**: Modal for inviting new users
- **Permission-based UI**: Components show/hide based on user permissions

## Permission Structure

### Core Permissions

```php
// User Management
'view_users'           // Can view user list
'invite_users'         // Can send invitations
'remove_users'         // Can remove users from tenant
'manage_users'         // Full user management (includes invite + remove)

// Role Management
'view_roles'           // Can view role list
'create_roles'         // Can create new roles
'edit_roles'           // Can modify existing roles
'delete_roles'         // Can delete roles
'manage_roles'         // Full role management

// Permission Management
'view_permissions'     // Can view permission list
'grant_permissions'    // Can assign permissions to roles
'revoke_permissions'   // Can remove permissions from roles
'manage_permissions'   // Full permission management

// System Management
'view_dashboard'       // Can access dashboard
'view_analytics'       // Can view analytics
'manage_settings'      // Can modify tenant settings
'manage_owner'         // Can manage owner account
'view_tenant_info'     // Can view tenant information
'manage_tenant_info'   // Can modify tenant information
```

### Role Hierarchy

#### Owner
- **All permissions** - Full system access
- Can manage any user, role, or setting
- Cannot be removed or demoted by other users

#### Administrator
- **Most permissions** - Full management access
- Cannot manage owner account
- Can manage users, roles, and settings
- Cannot grant/revoke owner permissions

#### Manager
- **Limited management** - View access with some management
- Can view users, roles, and analytics
- Cannot modify system settings

#### Member
- **Basic access** - Dashboard and profile access
- Can view basic tenant information
- Cannot access management features

#### Viewer
- **Read-only access** - Minimal system access
- Can view dashboard and basic information
- No modification capabilities

## Implementation Details

### Backend Permission Checking

#### 1. Service Layer
```php
// Check if user has specific permission
$permissionService->userHasPermission($userId, $tenantId, 'invite_users');

// Check if user has any of multiple permissions
$permissionService->userHasAnyPermission($userId, $tenantId, ['invite_users', 'remove_users']);

// Check if user has all required permissions
$permissionService->userHasAllPermissions($userId, $tenantId, ['invite_users', 'remove_users']);
```

#### 2. Request Authorization
```php
// In FormRequest classes
public function authorize(): bool
{
    $tenantId = tenant('id');
    $user = $this->user();
    
    return $this->permissionService->userHasPermission(
        $user->id, 
        $tenantId, 
        'invite_users'
    );
}
```

#### 3. Controller Usage
```php
// Automatically injects permissions into all tenant pages
protected function getTenantProps(Request $request): array
{
    $user = $request->user();
    $tenantId = tenant('id');
    
    // Get dynamic permissions from service
    $permissions = $this->permissionService->getUserPermissionsObject($user->id, $tenantId);
    
    return [
        'permissions' => $permissions,
        // ... other props
    ];
}
```

### Frontend Permission Usage

#### 1. Conditional Rendering
```tsx
{permissions.can_invite_users && (
    <InviteUsersDialog 
        availableRoles={availableRoles} 
        onSuccess={handleSuccess} 
    />
)}
```

#### 2. Permission-based Actions
```tsx
{permissions.can_remove_users && (
    <DropdownMenuItem onClick={() => handleRemoveUser(userCard)}>
        <Trash2 className="mr-2 h-4 w-4" /> Remove User
    </DropdownMenuItem>
)}
```

#### 3. Dynamic UI States
```tsx
const canManageUsers = permissions.can_invite_users || permissions.can_remove_users;

return (
    <div className={canManageUsers ? 'space-y-4' : 'space-y-2'}>
        {/* Different layouts based on permissions */}
    </div>
);
```

## Database Schema

### Tenant Database Tables
```sql
-- Roles table
CREATE TABLE roles (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    guard_name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    guard_name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Role-Permission pivot table
CREATE TABLE role_has_permissions (
    permission_id BIGINT,
    role_id BIGINT,
    PRIMARY KEY (permission_id, role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

### Central Database Tables
```sql
-- Users table (central)
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Tenant-User pivot table
CREATE TABLE tenant_users (
    id BIGINT PRIMARY KEY,
    tenant_id UUID,
    user_id BIGINT,
    role VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Setup Instructions

### 1. Run Migrations
```bash
# Run tenant migrations for each tenant
php artisan tenant:migrate

# Or run manually for specific tenant
php artisan tenant:artisan --tenant={tenant_id} migrate
```

### 2. Seed Default Data
```bash
# Seed roles and permissions for a tenant
php artisan tenant:artisan --tenant={tenant_id} db:seed --class=TenantRolesAndPermissionsSeeder
```

### 3. Assign Roles to Users
```php
// In your tenant setup logic
$user = User::find($userId);
$tenantId = $tenant->id;

// Create tenant user with role
TenantUser::create([
    'tenant_id' => $tenantId,
    'user_id' => $user->id,
    'role' => 'owner', // or 'admin', 'manager', etc.
]);
```

## Best Practices

### 1. Permission Naming
- Use descriptive, action-based names: `invite_users`, `remove_users`
- Group related permissions: `manage_users` includes `invite_users` + `remove_users`
- Use consistent naming conventions across the system

### 2. Role Design
- Keep roles focused on specific responsibilities
- Avoid creating too many roles (aim for 3-5 main roles)
- Use permission inheritance for role hierarchies

### 3. Security Considerations
- Always check permissions at the request level
- Use middleware for route-level protection
- Validate permissions in both frontend and backend
- Log permission checks for audit trails

### 4. Performance
- Cache permission results when possible
- Use eager loading for role-permission relationships
- Consider database indexing on frequently queried fields

## Testing

### 1. Permission Tests
```php
// Test permission checking
it('allows admin to invite users', function () {
    $admin = User::factory()->create();
    $tenant = Tenant::factory()->create();
    
    TenantUser::create([
        'tenant_id' => $tenant->id,
        'user_id' => $admin->id,
        'role' => 'admin'
    ]);
    
    $this->actingAs($admin);
    
    $response = $this->post("/t/{$tenant->id}/users", [
        'invitations' => [
            ['email' => 'test@example.com', 'role' => 'member']
        ]
    ]);
    
    $response->assertRedirect();
});
```

### 2. Role Tests
```php
// Test role-based access
it('prevents non-admin from managing users', function () {
    $member = User::factory()->create();
    $tenant = Tenant::factory()->create();
    
    TenantUser::create([
        'tenant_id' => $tenant->id,
        'user_id' => $member->id,
        'role' => 'member'
    ]);
    
    $this->actingAs($member);
    
    $response = $this->post("/t/{$tenant->id}/users", [
        'invitations' => [
            ['email' => 'test@example.com', 'role' => 'member']
        ]
    ]);
    
    $response->assertForbidden();
});
```

## Troubleshooting

### Common Issues

#### 1. Permission Not Found
- Check if permission exists in tenant database
- Verify permission name spelling
- Ensure tenant context is properly set

#### 2. Role Not Found
- Check if role exists in tenant database
- Verify role name matches exactly
- Check if user has been assigned to tenant

#### 3. Authorization Failing
- Check Laravel logs for permission check details
- Verify user has access to tenant
- Check if permission is properly assigned to role

#### 4. Frontend Permissions Not Updating
- Clear browser cache
- Check if permissions are being passed correctly from backend
- Verify permission names match between frontend and backend

### Debug Commands
```bash
# Check tenant permissions
php artisan tenant:artisan --tenant={tenant_id} tinker --execute="echo 'Permissions: '; \App\Models\TenantPermission::all()->pluck('name')->toArray();"

# Check tenant roles
php artisan tenant:artisan --tenant={tenant_id} tinker --execute="echo 'Roles: '; \App\Models\TenantRole::all()->pluck('name')->toArray();"

# Check user permissions
php artisan tenant:artisan --tenant={tenant_id} tinker --execute="echo 'User Permissions: '; \App\Services\PermissionService::getUserPermissions(1, '{tenant_id}')->pluck('name')->toArray();"
```

## Future Enhancements

### 1. Permission Groups
- Group related permissions for easier management
- Implement permission inheritance
- Add permission categories (user, system, data)

### 2. Advanced Role Features
- Role hierarchies and inheritance
- Conditional permissions based on data
- Time-based permission restrictions

### 3. Audit and Monitoring
- Permission usage tracking
- Role change history
- Security event logging

### 4. UI Improvements
- Permission management interface
- Role assignment interface
- Permission visualization tools
