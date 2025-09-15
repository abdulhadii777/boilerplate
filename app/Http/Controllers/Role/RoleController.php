<?php

namespace App\Http\Controllers\Role;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\Role\PermissionResource;
use App\Http\Resources\Role\RoleResource;
use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    public function __construct(
        private RoleService $roleService
    ) {}

    public function index(): Response
    {
        $this->authorizeForUser(Auth::guard('tenant')->user(), 'viewAny', Role::class);

        $roles = Role::with('permissions')
            ->withCount('permissions')
            ->withCount('users')
            ->get();
        $permissions = Permission::orderBy('name')->get();

        return Inertia::render('roles/index', [
            'roles' => RoleResource::collection($roles)->resolve(),
            'permissions' => PermissionResource::collection($permissions)->resolve(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $this->authorizeForUser(Auth::guard('tenant')->user(), 'create', Role::class);

        $this->roleService->createRole($request->validated());

        return back()->with('success', 'Role created successfully.');
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        try {
            $this->authorizeForUser(Auth::guard('tenant')->user(), 'update', $role);
        } catch (AuthorizationException $e) {
            return back()->with('error', $e->getMessage());
        }

        $this->roleService->updateRole($role, $request->validated());

        return back()->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        try {
            $this->authorizeForUser(Auth::guard('tenant')->user(), 'delete', $role);
        } catch (AuthorizationException $e) {
            return back()->with('error', $e->getMessage());
        }

        $this->roleService->deleteRole($role);

        return back()->with('success', 'Role deleted successfully.');
    }

    public function copy(Role $role): RedirectResponse
    {
        try {
            $this->authorizeForUser(Auth::guard('tenant')->user(), 'copy', $role);
        } catch (AuthorizationException $e) {
            return back()->with('error', $e->getMessage());
        }

        $this->roleService->copyRole($role);

        return back()->with('success', 'Role copied successfully.');
    }
}
