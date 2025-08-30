<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreRoleRequest;
use App\Models\TenantRole;
use App\Models\TenantPermission;
use App\Services\RoleService;
use Inertia\Response;

class RolesController extends Controller
{
    public function __construct(
        private RoleService $roleService
    ) {}

    /**
     * Display the roles management page.
     */
    public function index(Request $request): Response
    {
        // Get dynamic roles from database
        $availableRoles = TenantRole::with('permissions')
            ->get()
            ->map(function ($role) {
                return [
                    'name' => $role->name,
                    'display_name' => $role->display_name ?? ucfirst($role->name),
                    'description' => $role->description ?? $this->roleService->getRoleDescription($role->name),
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permission_count' => $role->permissions->count(),
                ];
            });

        // Get all available permissions from database
        $availablePermissions = TenantPermission::all()
            ->map(function ($permission) {
                return [
                    'name' => $permission->name,
                    'display_name' => $this->roleService->getPermissionDisplayName($permission->name),
                    'description' => $this->roleService->getPermissionDescription($permission->name),
                ];
            });

        return $this->renderTenantPage('roles/index', [
            'availableRoles' => $availableRoles,
            'availablePermissions' => $availablePermissions,
        ]);
    }



    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request)
    {
        return response()->json(
            $this->roleService->createRole($request->validated())
        );
    }
}
