<?php

namespace App\Services;

use App\Mail\UserInvitation;
use App\Models\Invite;
use App\Models\TenantUser;
use App\Services\UserService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class UserInviteService
{
    public function __construct(
        private ActivityLogService $activityLogService
    ) {}

    public function createInvites(array $emails, int $roleId, ?Carbon $expiresAt = null): Collection    
    {
        $invites = collect();

        foreach ($emails as $email) {
            // Check if user already exists
            if (TenantUser::where('email', $email)->exists()) {
                continue;
            }

            // Check if invite already exists and is pending
            if (Invite::where('email', $email)->whereNull('accepted_at')->exists()) {
                continue;
            }

            $invite = Invite::create([
                'email' => $email,
                'role_id' => $roleId,
                'expires_at' => $expiresAt,
                'invited_by' => Auth::guard('tenant')->id(),
            ]);

            $invites->push($invite);

            // Activity logging is now handled by the InviteObserver
        }

        return $invites;
    }

    public function sendInvitation(Invite $invite): bool
    {
        try {
            Mail::to($invite->email)->send(new UserInvitation($invite));

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function resendInvitation(Invite $invite): bool
    {
        // Allow resending expired invites, but check resent count
        if (! $invite->canBeResent()) {
            return false;
        }

        $invite->increment('resent_count');
        $invite->update([
            'token' => \Illuminate\Support\Str::random(64),
            'invited_by' => \Illuminate\Support\Facades\Auth::id(),
            'expires_at' => now()->addDays(7), // Reset expiry to 7 days from now
        ]);

        return $this->sendInvitation($invite);
    }

    public function cancelInvite(Invite $invite): bool
    {
        // Delete the invite instead of marking as cancelled
        return $invite->delete();
    }

    public function acceptInvite(string $token, array $userData): ?TenantUser
    {
        $invite = Invite::where('token', $token)
            ->whereNull('accepted_at')
            ->first();

        if (! $invite || $invite->isExpired()) {
            return null;
        }

        // Prepare user data
        $createUserData = [
            'tenant_id' => $userData['tenant_id'],
            'email' => $invite->email,
            'role_id' => $invite->role_id,
        ];

        // Add password fields only if they exist (for new users)
        if (isset($userData['name'])) {
            $createUserData['name'] = $userData['name'];
        }
        if (isset($userData['password'])) {
            $createUserData['password'] = $userData['password'];
        }

        // Create the user or create relationship for existing user
        $user = app(UserService::class)->createUserFromInvite($createUserData);

        // Mark invite as accepted
        $invite->update([
            'accepted_at' => now(),
        ]);

        return $user;
    }

    public function getInvites(array $filters = []): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = Invite::with('role')
            ->when(isset($filters['status']), function ($query) use ($filters) {
                if ($filters['status'] === 'pending') {
                    $query->whereNull('accepted_at');
                } elseif ($filters['status'] === 'accepted') {
                    $query->whereNotNull('accepted_at');
                }
            })
            ->when(isset($filters['search']), function ($query) use ($filters) {
                $query->where('email', 'like', '%'.$filters['search'].'%');
            });

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function deleteInvite(Invite $invite): bool
    {
        return $invite->delete();
    }
}
