<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateRoleRequest;
use App\Http\Resources\Role\RoleResource;
use App\Http\Resources\User\InviteResource;
use App\Http\Resources\User\UserResource;
use App\Models\Role;
use App\Models\TenantUser;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function index(): Response
    {
        $this->authorizeForUser(Auth::guard('tenant')->user(), 'viewAny', TenantUser::class);

        $users = $this->userService->getUsers();
        $invites = $this->userService->getInvites();
        $roles = Role::orderBy('name')->get();

        // Calculate separate counts for each tab
        $activeUsersCount = $users->where('status', 'active')->count();
        $inactiveUsersCount = $users->where('status', 'inactive')->count();
        $totalInvitesCount = $invites->count();

        return Inertia::render('users/index', [
            'users' => UserResource::collection($users)->resolve(),
            'invites' => InviteResource::collection($invites)->resolve(),
            'roles' => RoleResource::collection($roles)->resolve(),
            'activeUsersCount' => $activeUsersCount,
            'inactiveUsersCount' => $inactiveUsersCount,
            'totalInvites' => $totalInvitesCount,
        ]);
    }

    public function updateRole(UpdateRoleRequest $request, int $userId): RedirectResponse
    {
        $user = TenantUser::findOrFail($userId);

        $this->authorizeForUser(Auth::guard('tenant')->user(), 'assignRoles', $user);

        // Check if this would remove the Admin role from the only admin user
        if (! $this->userService->canRemoveAdminRole($user, $request->validated('role_id'))) {
            return back()->with('error', 'Cannot remove the Admin role from the only admin user. Please assign the Admin role to another user first.');
        }

        $this->userService->updateUserRole($user, $request->validated('role_id'));

        return back()->with('success', 'User role updated successfully.');
    }

    public function disable(int $userId): RedirectResponse
    {
        $user = TenantUser::findOrFail($userId);

        $this->authorizeForUser(Auth::guard('tenant')->user(), 'delete', $user);

        // Check if this is the only admin user
        if (! $this->userService->canDeleteOrDisableAdmin($user)) {
            return back()->with('error', 'Cannot disable the only admin user. Please assign the Admin role to another user first.');
        }

        $this->userService->disableUser($user);

        return back()->with('success', 'User disabled successfully.');
    }

    public function enable(int $userId): RedirectResponse
    {
        $user = TenantUser::findOrFail($userId);

        $this->authorizeForUser(Auth::guard('tenant')->user(), 'enable', $user);

        $this->userService->enableUser($user);

        return back()->with('success', 'User enabled successfully.');
    }

    public function destroy(int $userId): RedirectResponse
    {
        $user = TenantUser::findOrFail($userId);

        $this->authorizeForUser(Auth::guard('tenant')->user(), 'delete', $user);

        // Check if this is the only admin user
        if (! $this->userService->canDeleteOrDisableAdmin($user)) {
            return back()->with('error', 'Cannot delete the only admin user. Please assign the Admin role to another user first.');
        }

        $this->userService->deleteUser($user);

        return back()->with('success', 'User permanently deleted.');
    }
}
