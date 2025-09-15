<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Auth\Access\AuthorizationException;

class RoleService
{
    public function createRole(array $data): Role
    {
        /** @var Role $role */
        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'tenant',
        ]);

        if (isset($data['description'])) {
            $role->update(['description' => $data['description']]);
        }

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        // Observer will automatically dispatch the event when role is created

        return $role;
    }

    public function updateRole(Role $role, array $data): Role
    {
        if ($role->isSystem()) {
            throw new AuthorizationException('System roles cannot be modified.');
        }

        $role->update([
            'name' => $data['name'],
        ]);

        if (isset($data['description'])) {
            $role->update(['description' => $data['description']]);
        }

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role;
    }

    public function deleteRole(Role $role): bool
    {
        if ($role->isSystem()) {
            throw new AuthorizationException('System roles cannot be deleted.');
        }

        return $role->delete();
    }

    public function copyRole(Role $role): Role
    {
        if ($role->isSystem()) {
            throw new AuthorizationException('System roles cannot be copied.');
        }

        $baseName = $role->name . ' (Copy)';
        $newName = $baseName;
        $counter = 1;

        // Ensure unique name
        while (Role::where('name', $newName)->exists()) {
            $newName = $baseName . ' ' . $counter;
            $counter++;
        }

        $newRole = $role->replicate();
        $newRole->name = $newName;
        $newRole->save();

        // Copy permissions
        $newRole->syncPermissions($role->permissions);

        return $newRole;
    }
}
