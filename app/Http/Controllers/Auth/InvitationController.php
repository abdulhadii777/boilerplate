<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\TenantUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    /**
     * Show the invitation acceptance form.
     */
    public function show(string $token): Response
    {
        try {
            $invitation = Invitation::where('token', $token)
                ->where('status', 'pending')
                ->first();

            if (! $invitation) {
                abort(404, 'Invitation not found.');
            }

            if ($invitation->isExpired()) {
                abort(404, 'Invitation expired.');
            }

            // Load tenant separately to avoid relationship issues
            $tenant = \App\Models\Tenant::find($invitation->tenant_id);
            if (!$tenant) {
                abort(404, 'Tenant not found.');
            }

            // Prepare invitation data with tenant info
            $invitationData = [
                'id' => $invitation->id,
                'tenant_id' => $invitation->tenant_id,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'token' => $invitation->token,
                'status' => $invitation->status,
                'expires_at' => $invitation->expires_at,
                'created_at' => $invitation->created_at,
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                ],
            ];

            return Inertia::render('auth/accept-invitation', [
                'invitation' => $invitationData,
            ]);
            
        } catch (\Exception $e) {
            abort(500, 'Error loading invitation.');
        }
    }

    /**
     * Accept the invitation and create/update user.
     */
    public function accept(Request $request, string $token): Response
    {
        try {
            $invitation = Invitation::where('token', $token)
                ->where('status', 'pending')
                ->first();

            if (! $invitation) {
                abort(404, 'Invitation not found.');
            }

            if ($invitation->isExpired()) {
                abort(404, 'Invitation expired.');
            }

            // Load tenant separately
            $tenant = \App\Models\Tenant::find($invitation->tenant_id);
            if (!$tenant) {
                abort(404, 'Tenant not found.');
            }

            $request->validate([
                'name' => 'required|string|max:255',
                'password' => 'required|string|min:8|confirmed',
            ]);

            DB::beginTransaction();

            // Find or create user
            $user = User::firstOrCreate(
                ['email' => $invitation->email],
                [
                    'name' => $request->name,
                    'password' => Hash::make($request->password),
                ]
            );

            // Create tenant user relationship
            TenantUser::create([
                'tenant_id' => $invitation->tenant_id,
                'user_id' => $user->id,
                'role' => $invitation->role,
            ]);

            // Mark invitation as accepted
            $invitation->markAsAccepted();

            DB::commit();

            // Log the user in
            auth()->login($user);

            return Inertia::render('auth/invitation-accepted', [
                'tenant' => $tenant,
                'redirectUrl' => route('tenant.dashboard', $tenant),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'general' => 'Failed to accept invitation. Please try again.',
            ]);
        }
    }
}
