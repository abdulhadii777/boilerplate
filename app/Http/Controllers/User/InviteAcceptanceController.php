<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\AcceptInviteRequest;
use App\Http\Resources\User\InviteResource;
use App\Services\UserInviteService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InviteAcceptanceController extends Controller
{
    public function __construct(
        private UserInviteService $userInviteService
    ) {}

    public function show(string $token): Response
    {
        $invite = \App\Models\Invite::where('token', $token)
            ->whereNull('accepted_at')
            ->with('role')
            ->first();

        if (! $invite || $invite->isExpired()) {
            abort(404, 'Invalid or expired invitation.');
        }
        
        $is_present = false;
        if (\App\Models\CentralUser::where('email', $invite->email)->first()) {
            $is_present = true;
        }

        // Check if user is already logged in
        $is_logged_in = \Illuminate\Support\Facades\Auth::guard('web')->check();
        $current_user_email = $is_logged_in ? \Illuminate\Support\Facades\Auth::guard('web')->user()->email : null;

        return Inertia::render('users/invite-acceptance', [
            'invite' => new InviteResource($invite),
            'token' => $token,
            'is_present' => $is_present,
            'is_logged_in' => $is_logged_in,
            'current_user_email' => $current_user_email,
        ]);
    }

    public function store(AcceptInviteRequest $request): RedirectResponse
    {
        $user = $this->userInviteService->acceptInvite($request->token, $request->validated());

        if (! $user) {
            return back()->withErrors(['token' => 'Invalid or expired invitation.']);
        }

        // Check if user is currently logged in
        $is_logged_in = \Illuminate\Support\Facades\Auth::guard('web')->check();
        
        if ($is_logged_in) {
            // User is logged in - redirect to dashboard
            return redirect()->route('dashboard', ['tenant' => tenant('id')])->with('success', 'Invitation accepted! You have been added to the organization.');
        }

        // User is not logged in - check if they were recently created
        $centralUser = \App\Models\CentralUser::where('email', $user->email)->first();
        if ($centralUser && $centralUser->wasRecentlyCreated) {
            // New user - redirect to dashboard with success message
            return redirect()->route('dashboard', ['tenant' => tenant('id')])->with('success', 'Welcome! Your account has been created successfully.');
        } else {
            // Existing user - redirect to login with info message
            return redirect()->route('login', ['tenant' => tenant('id')])->with('success', 'Invitation accepted! Please log in to access your account.');
        }
    }
}
