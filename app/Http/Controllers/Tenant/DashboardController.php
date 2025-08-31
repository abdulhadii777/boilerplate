<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Display the tenant dashboard.
     */
    public function index(Request $request): Response
    {
        $this->authorize('can_view_dashboard');

        $tenantId = tenant('id');

        return $this->renderTenantPage('dashboard/tenant', [
            'stats' => [
                'total_users' => \App\Models\TenantUser::where('tenant_id', $tenantId)->count(),
                'total_roles' => 3, // owner, admin, member (hardcoded for now)
                'total_permissions' => 8, // updated based on TenantDatabaseSeeder
            ],
        ]);
    }
}