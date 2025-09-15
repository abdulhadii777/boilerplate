<?php

namespace App\Services;

use App\Models\CentralUser;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\TenantUser;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Facades\Tenancy;

class BusinessService
{
    /**
     * Get all tenants for a central user
     */
    public function getUserTenants(CentralUser $centralUser): Collection
    {
        return $centralUser->tenants()->get()->load('users');
    }

    /**
     * Create a new tenant and associate it with the central user
     */
    public function createTenant(CentralUser $centralUser, string $name): Tenant
    {
        // Create the tenant
        $tenant = Tenant::create([
            'name' => $name,
        ]);

        // Associate the tenant with the central user
        $centralUser->tenants()->attach($tenant->id, [
            'global_user_id' => $centralUser->global_id,
        ]);

        // Initialize tenancy to work with tenant database
        tenancy()->initialize($tenant);

        // Get or create the tenant user
        $tenantUser = TenantUser::where('global_id', $centralUser->global_id)->first();

        // If tenant user doesn't exist, create it
        if (! $tenantUser) {
            $tenantUser = TenantUser::create([
                'global_id' => $centralUser->global_id,
                'name' => $centralUser->name,
                'email' => $centralUser->email,
                'email_verified_at' => $centralUser->email_verified_at,
            ]);
        }

        // Assign admin role by default (if roles table exists)
        try {
            $adminRole = Role::where('name', 'Admin')->where('guard_name', 'tenant')->first();
            if ($adminRole) {
                $tenantUser->assignRole($adminRole);
            }
        } catch (\Exception $e) {
            // Roles table might not exist yet, skip role assignment
            // This can happen during testing or initial setup
        }

        return $tenant;
    }

    /**
     * Switch to a specific tenant
     */
    public function switchToTenant(CentralUser $centralUser, Tenant $tenant): void
    {
        // Verify the user has access to this tenant
        if (! $centralUser->tenants()->where('tenant_id', $tenant->id)->exists()) {
            throw new \Exception('You do not have access to this business.');
        }

        // Initialize tenancy
        tenancy()->initialize($tenant);

        // Get the tenant user
        $tenantUser = TenantUser::where('global_id', $centralUser->global_id)->first();

        if (! $tenantUser) {
            throw new \Exception('User not found in this business.');
        }

        // Login as tenant user
        Auth::guard('tenant')->login($tenantUser);
    }

    /**
     * Check if user has access to a specific tenant
     */
    public function hasAccessToTenant(CentralUser $centralUser, Tenant $tenant): bool
    {
        return $centralUser->tenants()->where('tenant_id', $tenant->id)->exists();
    }

    /**
     * Get tenant details
     */
    public function getTenantDetails(Tenant $tenant): array
    {   
        return [
            'id' => $tenant->id,
            'name' => $tenant->name,
            'created_at' => $tenant->created_at,
            'updated_at' => $tenant->updated_at,
            'user_count' => $tenant->users()->count(),
        ];
    }

    /**
     * Update a tenant's name
     */
    public function updateTenant(Tenant $tenant, string $name): bool
    {
        return $tenant->update(['name' => $name]);
    }

    /**
     * Delete a tenant (admin only)
     */
    public function deleteTenant(Tenant $tenant): bool
    {
        // This will trigger the tenant deletion events
        // which will clean up the database and files
        return $tenant->delete();
    }

    /**
     * Toggle favorite status for a business
     */
    public function toggleFavoriteBusiness(CentralUser $centralUser, Tenant $tenant): bool
    {
        // Verify the user has access to this tenant
        if (! $this->hasAccessToTenant($centralUser, $tenant)) {
            throw new \Exception('You do not have access to this business.');
        }

        // Check if this business is already favorite
        if ($centralUser->isFavoriteBusiness($tenant)) {
            // Remove favorite
            return $centralUser->removeFavoriteBusiness();
        } else {
            // Set as favorite (this will automatically remove other favorites)
            return $centralUser->setFavoriteBusiness($tenant);
        }
    }

    /**
     * Check if a business is favorite for a central user
     */
    public function isFavoriteBusiness(CentralUser $centralUser, Tenant $tenant): bool
    {
        return $centralUser->isFavoriteBusiness($tenant);
    }

    /**
     * Get the favorite business for a central user
     */
    public function getFavoriteBusiness(CentralUser $centralUser): ?Tenant
    {
        return $centralUser->favoriteBusiness();
    }
}
