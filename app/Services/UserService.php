<?php

namespace App\Services;

use App\Models\Invitation;
use App\Models\TenantRole;
use App\Models\TenantUser;
use App\Models\User;
use App\Notifications\UserInvitation;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class UserService
{
    /**
     * Get paginated users for the current tenant.
     */
    public function getUsersForIndex(string $tenantId): LengthAwarePaginator
    {
        return TenantUser::where('tenant_id', $tenantId)
            ->with('user:id,name,email,created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
    }

    /**
     * Get all invitations (pending, accepted, expired) for the current tenant.
     */
    public function getInvitationsForIndex(string $tenantId): Collection
    {
        return Invitation::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get unified user cards combining users and invitations.
     */
    public function getUnifiedUserCards(string $tenantId): Collection
    {
        $users = TenantUser::where('tenant_id', $tenantId)
            ->with('user:id,name,email,created_at')
            ->get();

        $invitations = Invitation::where('tenant_id', $tenantId)
            ->where('status', '!=', 'accepted') // Exclude accepted invitations
            ->get();



        $userCards = collect();

        // Add existing users
        foreach ($users as $tenantUser) {
            $userCards->push([
                'id' => 'user_'.$tenantUser->id,
                'type' => 'user',
                'email' => $tenantUser->user->email,
                'role' => $tenantUser->role,
                'name' => $tenantUser->user->name,
                'avatar' => $tenantUser->user->name,
                'created_at' => $tenantUser->created_at,
                'tenant_id' => $tenantUser->tenant_id,
                'user_id' => $tenantUser->user_id,
            ]);
        }

        // Add invitations
        foreach ($invitations as $invitation) {
            $userCards->push([
                'id' => 'invitation_'.$invitation->id,
                'type' => 'invitation',
                'email' => $invitation->email,
                'role' => $invitation->role,
                'status' => $invitation->status,
                'created_at' => $invitation->created_at,
                'expires_at' => $invitation->expires_at,
                'tenant_id' => $invitation->tenant_id,
                'invitation_id' => $invitation->id,
                'token' => $invitation->token,
            ]);
        }

        // Sort by creation date (newest first)
        return $userCards->sortByDesc('created_at')->values();
    }

    /**
     * Get available roles for the current tenant.
     * This method fetches roles directly from the tenant database.
     */
    public function getAvailableRoles(): Collection
    {
        try {
            // Simple direct query to get all roles
            $roles = TenantRole::where('guard_name', 'web')
                ->orderBy('name')
                ->get(['name', 'display_name', 'description']);

            return $roles;
        } catch (\Exception $e) {
            return collect();
        }
    }


    /**
     * Get available roles for the current user.
     * For now, returns all roles from the tenant database.
     */
    public function getAvailableRolesForUser(int $userId, string $tenantId): Collection
    {
        try {
            $roles = $this->getAvailableRoles();
            
            return $roles;
        } catch (\Exception $e) {
            return collect();
        }
    }



    /**
     * Send invitations to multiple users.
     */
    public function sendInvitations(array $invitations, string $tenantId): array
    {
        $results = [
            'sent' => 0,
            'skipped' => 0,
            'errors' => [],
        ];

        foreach ($invitations as $invitationData) {
            try {
                $result = $this->processInvitation($invitationData, $tenantId);

                if ($result['success']) {
                    $results['sent']++;
                } else {
                    $results['skipped']++;
                    $results['errors'][] = $result['message'];
                }
            } catch (\Exception $e) {
                $results['errors'][] = "Error processing invitation for {$invitationData['email']}: ".$e->getMessage();
            }
        }

        return $results;
    }

    /**
     * Process a single invitation.
     */
    private function processInvitation(array $invitationData, string $tenantId): array
    {
        // Check if user already exists
        $existingUser = User::where('email', $invitationData['email'])->first();

        if ($existingUser) {
            // Check if user is already in this tenant
            $existingTenantUser = TenantUser::where('tenant_id', $tenantId)
                ->where('user_id', $existingUser->id)
                ->first();

            if ($existingTenantUser) {
                return [
                    'success' => false,
                    'message' => "User {$invitationData['email']} is already a member of this tenant",
                ];
            }
        }

        // Check if invitation already exists
        $existingInvitation = Invitation::where('tenant_id', $tenantId)
            ->where('email', $invitationData['email'])
            ->where('status', 'pending')
            ->first();

        if ($existingInvitation) {

            return [
                'success' => false,
                'message' => "An invitation for {$invitationData['email']} already exists",
            ];
        }



        // Create invitation
        try {
            $invitation = Invitation::create([
                'tenant_id' => $tenantId,
                'email' => $invitationData['email'],
                'role' => $invitationData['role'],
                'status' => 'pending',
            ]);

        } catch (\Exception $e) {
            throw $e;
        }



        // Send invitation email using notification system
        try {
            $notification = new \App\Notifications\UserInvitation($invitation);
            \Notification::route('mail', $invitationData['email'])
                ->notify($notification);
        } catch (\Exception $e) {
            // Email sending failed, but invitation was created
        }

        return [
            'success' => true,
            'message' => "Invitation sent to {$invitationData['email']}",
            'invitation' => $invitation,
        ];
    }

    /**
     * Cancel an invitation.
     */
    public function cancelInvitation(Invitation $invitation, string $tenantId): bool
    {
        if ($invitation->tenant_id !== $tenantId) {
            return false;
        }

        return $invitation->delete();
    }

    /**
     * Remove a user from the tenant.
     */
    public function removeUserFromTenant(TenantUser $tenantUser, string $tenantId): bool
    {
        if ($tenantUser->tenant_id !== $tenantId) {
            return false;
        }

        return $tenantUser->delete();
    }
}
