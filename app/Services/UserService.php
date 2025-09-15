<?php

namespace App\Services;

use App\Models\Invite;
use App\Models\Role;
use App\Models\TenantUser;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use App\Models\CentralUser;
use Illuminate\Support\Facades\Auth;

class UserService
{
    public function getUsers(): Collection
    {
        $users = TenantUser::with('roles')->latest()->get();

        // Add is_admin flag to each user
        $users->each(function (TenantUser $user) {
            $user->setAttribute('is_admin', $user->hasRole('Admin'));
        });

        return $users;
    }

    public function getInvites(): Collection
    {
        $invites = Invite::whereNull('accepted_at')
            ->whereNotExists(function ($query) {
                $query->select(\Illuminate\Support\Facades\DB::raw(1))
                    ->from('users')
                    ->whereColumn('users.email', 'invites.email');
            })
            ->with('role')
            ->latest()
            ->get();

        // Add status information to each invite
        $invites->each(function (Invite $invite) {
            if ($invite->isExpired()) {
                $invite->setAttribute('status', 'expired');
            } else {
                $invite->setAttribute('status', 'pending');
            }
            $invite->setAttribute('can_resend', $invite->canBeResent());
            $invite->setAttribute('can_cancel', true);
        });

        return $invites;
    }

    public function updateUserRole(TenantUser $user, int $roleId): bool
    {
        $role = Role::findOrFail($roleId);
        $user->syncRoles([$role]);

        return true;
    }

    public function disableUser(TenantUser $user): bool
    {
        $result = $user->update(['is_disabled' => true]);

        if ($result) {
            // Observer will automatically dispatch the event when is_active changes
        }

        return $result;
    }

    public function enableUser(TenantUser $user): bool
    {
        return $user->update(['is_disabled' => false]);
    }

    public function deleteUser(TenantUser $user): bool
    {
        return $user->delete();
    }

    public function createUserFromInvite(array $data): TenantUser
    {
        $tenantId = $data['tenant_id'];
        $email = $data['email'];
        
        // Check if user already exists in central database
        $centralUser = CentralUser::where('email', $email)->first();
        
        if ($centralUser) {
            // User exists - just create the relationship
            tenancy()->initialize($tenantId);
            
            // Find existing tenant user or create one
            $tenantUser = TenantUser::where('global_id', $centralUser->global_id)->first();
            
            if (!$tenantUser) {
                $tenantUser = TenantUser::create([
                    'global_id' => $centralUser->global_id,
                    'name' => $centralUser->name,
                    'email' => $centralUser->email,
                ]);
            }
            
            // Create the relationship if it doesn't exist
            if (!$centralUser->tenants()->where('tenant_id', $tenantId)->exists()) {
                $centralUser->tenants()->attach($tenantId, [
                    'global_user_id' => $centralUser->global_id,
                ]);
            }
        } else {
            // User doesn't exist - create new user
            $centralUser = CentralUser::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);
            
            // Initialize tenancy and let the sync happen automatically
            tenancy()->initialize($tenantId);
            
            // Find the synced tenant user
            $tenantUser = TenantUser::where('global_id', $centralUser->global_id)->first();
            
            // If sync didn't work, create manually as fallback
            if (!$tenantUser) {
                $tenantUser = TenantUser::create([
                    'global_id' => $centralUser->global_id,
                    'name' => $centralUser->name,
                    'email' => $centralUser->email,
                ]);
            }
        }
        
        // Assign role if specified
        if (isset($data['role_id'])) {
            $role = Role::find($data['role_id']);
            if ($role) {
                $tenantUser->assignRole($role);   
            }
        }
        
        // Only login new users, not existing users
        if (!$centralUser->wasRecentlyCreated) {
            // For existing users, don't login - they should remain logged out
            return $tenantUser;
        }
        
        // Login only new users
        Auth::guard('web')->login($centralUser);
        Auth::guard('tenant')->login($tenantUser);
        
        return $tenantUser;
    }

    /**
     * Check if a user is the only admin user
     */
    public function isOnlyAdminUser(TenantUser $user): bool
    {
        if (! $user->hasRole('Admin')) {
            return false;
        }

        return TenantUser::role('Admin')->count() === 1;
    }

    /**
     * Validate admin role operations
     */
    public function canRemoveAdminRole(TenantUser $user, int $newRoleId): bool
    {
        if (! $user->hasRole('Admin') || ! $this->isOnlyAdminUser($user)) {
            return true;
        }

        $newRole = Role::find($newRoleId);

        return $newRole && $newRole->isAdmin();
    }

    /**
     * Validate admin user deletion/disable operations
     */
    public function canDeleteOrDisableAdmin(TenantUser $user): bool
    {
        return ! ($user->hasRole('Admin') && $this->isOnlyAdminUser($user));
    }
}
