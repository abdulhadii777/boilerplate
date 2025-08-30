<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreRoleRequest;
use App\Services\RoleService;
use Illuminate\Http\Request;
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
        return $this->renderTenantPage('roles/index', [
            'availableRoles' => $this->roleService->getRolesForIndex(),
            'availablePermissions' => $this->roleService->getPermissionsForIndex(),
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
