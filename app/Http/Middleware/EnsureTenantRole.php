<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ?string $role = null): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        // Get current tenant ID from tenancy context
        $tenantId = tenant('id');
        
        if (!$tenantId) {
            abort(400, 'Tenant ID not found in tenancy context.');
        }

        // Check if user has access to the current tenant
        if (!$request->user()->hasAccessToTenant($tenantId)) {
            abort(403, 'You do not have access to this tenant.');
        }

        // If specific role is required, check for it
        if ($role && !$request->user()->hasTenantRole($tenantId, $role)) {
            abort(403, "You need the '{$role}' role to access this resource.");
        }

        return $next($request);
    }
}