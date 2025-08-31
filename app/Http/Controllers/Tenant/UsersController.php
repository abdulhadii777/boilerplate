<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\DestroyInvitationRequest;
use App\Http\Requests\Tenant\DestroyUserRequest;
use App\Http\Requests\Tenant\StoreUserRequest;
use App\Models\Invitation;
use App\Models\TenantUser;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {
        parent::__construct();
    }

    /**
     * Display a listing of users in the tenant.
     */
    public function index(Request $request): Response
    {
        $this->authorize('can_manage_users');

        $tenantId = tenant('id');   

        return $this->renderTenantPage('users/index', [
            'userCards' => $this->userService->getUnifiedUserCards($tenantId),
            'availableRoles' => $this->userService->getAvailableRoles(),
        ]);
    }

    /**
     * Show the form for inviting new users.
     */
    public function create(Request $request): Response
    {
        $this->authorize('can_invite_users');

        $tenantId = tenant('id');

        return $this->renderTenantPage('users/create', [
            'availableRoles' => $this->userService->getAvailableRoles(),
        ]);
    }

    /**
     * Store newly invited users.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->authorize('can_invite_users');

        $tenantId = tenant('id');
        $invitations = $request->validated('invitations');

        $results = $this->userService->sendInvitations($invitations, $tenantId);

        $message = "Successfully sent {$results['sent']} invitation(s)";
        if ($results['skipped'] > 0) {
            $message .= ". {$results['skipped']} invitation(s) were skipped";
        }
        if (! empty($results['errors'])) {
            $message .= '. Some errors occurred: '.implode(', ', array_slice($results['errors'], 0, 3));
        }

        return redirect()->route('tenant.users.index', ['tenant' => $tenantId])
            ->with('success', $message);
    }

    /**
     * Remove an invitation.
     */
    public function destroyInvitation(DestroyInvitationRequest $request, Invitation $invitation): RedirectResponse
    {
        $this->authorize('can_remove_users');

        $tenantId = tenant('id');

        if ($this->userService->cancelInvitation($invitation, $tenantId)) {
            return redirect()->route('tenant.users.index', ['tenant' => $tenantId])
                ->with('success', 'Invitation cancelled successfully!');
        }

        return redirect()->route('tenant.users.index', ['tenant' => $tenantId])
            ->with('error', 'Failed to cancel invitation.');
    }

    /**
     * Remove a user from the tenant.
     */
    public function destroyUser(DestroyUserRequest $request, TenantUser $tenantUser): RedirectResponse
    {
        $this->authorize('can_remove_users');

        $tenantId = tenant('id');

        if ($this->userService->removeUserFromTenant($tenantUser, $tenantId)) {
            return redirect()->route('tenant.users.index', ['tenant' => $tenantId])
                ->with('success', 'User removed from tenant successfully!');
        }

        return redirect()->route('tenant.users.index', ['tenant' => $tenantId])
            ->with('error', 'Failed to remove user from tenant.');
    }
}
