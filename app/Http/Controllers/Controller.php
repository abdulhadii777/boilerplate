<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

abstract class Controller
{
    /**
     * Get common props for tenant pages.
     */
    protected function getTenantProps(Request $request): array
    {
        $user = $request->user();
        $tenant = tenant();
        $tenantId = tenant('id');

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
            'permissions' => [
                'can_grant' => in_array($user->getTenantRole($tenantId), ['owner', 'admin']),
                'can_revoke' => in_array($user->getTenantRole($tenantId), ['owner', 'admin']),
                'can_manage_owner' => $user->getTenantRole($tenantId) === 'owner',
                'can_manage_users' => in_array($user->getTenantRole($tenantId), ['owner', 'admin']),
                'can_manage_roles' => $user->getTenantRole($tenantId) === 'owner',
                'can_view_analytics' => true,
                'can_manage_settings' => in_array($user->getTenantRole($tenantId), ['owner', 'admin']),
            ],
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
