<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreInviteRequest;
use App\Models\Invite;
use App\Models\TenantUser;
use App\Services\UserInviteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class UserInviteController extends Controller
{
    public function __construct(
        private UserInviteService $userInviteService
    ) {}

    public function store(StoreInviteRequest $request): RedirectResponse
    {
        $this->authorizeForUser(Auth::guard('tenant')->user(), 'invite', TenantUser::class);

        $emails = array_filter(array_map('trim', explode(',', $request->validated('emails'))));
        $invites = $this->userInviteService->createInvites($emails, $request->validated('role_id'));

        // Send invitations
        foreach ($invites as $invite) {
            $this->userInviteService->sendInvitation($invite);
        }

        $message = count($invites).' invitation(s) sent successfully.';
        if (count($emails) > count($invites)) {
            $message .= ' Some emails were skipped (already invited or registered).';
        }

        return back()->with('success', $message);
    }

    public function cancel(int $inviteId): RedirectResponse
    {
        $invite = Invite::findOrFail($inviteId);

        $this->authorizeForUser(Auth::guard('tenant')->user(), 'cancelInvite', TenantUser::class);

        $this->userInviteService->cancelInvite($invite);

        return back()->with('success', 'Invitation cancelled successfully.');
    }

    public function resend(int $inviteId): RedirectResponse
    {
        $invite = Invite::findOrFail($inviteId);

        $this->authorizeForUser(Auth::guard('tenant')->user(), 'resendInvite', TenantUser::class);

        if (! $invite->canBeResent()) {
            return back()->with('error', 'Invitation cannot be resent.');
        }

        $this->userInviteService->resendInvitation($invite);

        return back()->with('success', 'Invitation resent successfully.');
    }
}
