<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRegistrationRequest;
use App\Models\User;
use App\Services\TenantProvisioningService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(
        private TenantProvisioningService $tenantProvisioningService
    ) {}

    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(StoreUserRegistrationRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
        ]);

        event(new Registered($user));

        // Create tenant and assign owner role
        $tenant = $this->tenantProvisioningService->createTenantForUser(
            $user,
            $request->validated('tenant_name')
        );

        Auth::login($user);

        // Redirect to tenant dashboard
        return redirect()->route('tenant.dashboard', ['tenant' => $tenant->id]);
    }
}
