<?php

namespace App\Http\Controllers;

use App\Services\PermissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

abstract class Controller
{
    protected PermissionService $permissionService;

    public function __construct()
    {
        $this->permissionService = app(PermissionService::class);
    }

    /**
     * Check if the current user has a specific permission.
     */
    protected function userCan(string $permission): bool
    {
        $user = request()->user();
        $tenantId = tenant('id');

        if (!$user || !$tenantId) {
            return false;
        }

        return $this->permissionService->userHasPermission($user->id, $tenantId, $permission);
    }

    /**
     * Authorize the current user has a specific permission or abort.
     */
    protected function authorize(string $permission): void
    {
        if (!$this->userCan($permission)) {
            abort(403, 'You do not have permission to access this resource.');
        }
    }

    /**
     * Get common props for tenant pages.
     */
    protected function getTenantProps(Request $request): array
    {
        $user = $request->user();
        $tenant = tenant();
        $tenantId = tenant('id');

        // Get user permissions for frontend
        $permissions = [];
        if ($user && $tenantId) {
            $permissions = $this->permissionService->getUserPermissionsForFrontend($user->id, $tenantId);
        }

        return [
            'tenant' => [
                'id' => $tenant->id,
                'name' => 'Organization Dashboard',
            ],
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getTenantRole($tenantId),
            ],
            'permissions' => $permissions,
        ];
    }

    /**
     * Render Inertia page with common tenant props.
     */
    protected function renderTenantPage(string $component, array $props = []): Response
    {
        $commonProps = $this->getTenantProps(request());

        return Inertia::render($component, array_merge($commonProps, $props));
    }
}
