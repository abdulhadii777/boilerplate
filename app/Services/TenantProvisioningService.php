<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;

class TenantProvisioningService
{
    /**
     * Create a new tenant and set up initial roles and permissions.
     */
    public function createTenantForUser(User $user, string $tenantName): Tenant
    {
        // Create the tenant with auto-generated UUID
        $tenant = Tenant::create();

        // The seeding happens automatically via the TenantCreated event pipeline
        // which runs TenantDatabaseSeeder to create roles and permissions
        
        // Create tenant-user relationship with owner role
        TenantUser::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'role' => 'owner',
        ]);

        return $tenant;
    }

    /**
     * Grant a role to a user in a specific tenant.
     */
    public function grantRoleToUser(User $user, string $tenantId, string $roleName): bool
    {
        // Check if user already has a role in this tenant
        $existingRole = TenantUser::where('tenant_id', $tenantId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingRole) {
            // Update existing role
            $existingRole->update(['role' => $roleName]);
        } else {
            // Create new role assignment
            TenantUser::create([
                'tenant_id' => $tenantId,
                'user_id' => $user->id,
                'role' => $roleName,
            ]);
        }

        return true;
    }

    /**
     * Remove a user's role from a specific tenant.
     */
    public function removeRoleFromUser(User $user, string $tenantId): bool
    {
        return TenantUser::where('tenant_id', $tenantId)
            ->where('user_id', $user->id)
            ->delete() > 0;
    }

    /**
     * Get all users with their roles for a specific tenant.
     */
    public function getUsersWithRoles(string $tenantId): \Illuminate\Database\Eloquent\Collection
    {
        return TenantUser::with('user')
            ->where('tenant_id', $tenantId)
            ->get();
    }
}