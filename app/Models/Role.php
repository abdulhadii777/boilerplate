<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * @property bool $is_system
 * @property string|null $description
 */
class Role extends SpatieRole
{
    use HasFactory;

    protected $fillable = [
        'name',
        'guard_name',
        'description',
        'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    /**
     * Check if this role is a system role
     */
    public function isSystem(): bool
    {
        return $this->is_system;
    }

    /**
     * Check if this role is the admin role
     */
    public function isAdmin(): bool
    {
        return $this->name === 'Admin';
    }

    /**
     * Get the number of users with this role
     */
    public function getUserCount(): int
    {
        return $this->users()->count();
    }

    /**
     * Check if this role can be modified
     */
    public function canBeModified(): bool
    {
        return ! $this->is_system;
    }

    /**
     * Check if this role can be deleted
     */
    public function canBeDeleted(): bool
    {
        if ($this->is_system) {
            return false;
        }

        // Don't allow deletion if there are users with this role
        return $this->getUserCount() === 0;
    }
}
