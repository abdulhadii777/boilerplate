<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\CentralUser;
use App\Models\TenantUser;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Models\Tenant;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class RegisteredUserController extends Controller
{
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
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.CentralUser::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $tenant = Tenant::create([
            'name' => $request->name
        ]);

        $centralUser = CentralUser::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $centralUser->tenants()->attach($tenant->id, [
            'global_user_id' => $centralUser->global_id,
        ]);

        tenancy()->initialize($tenant);

        $tenantUser = TenantUser::where('global_id', $centralUser->global_id)->first();

        // Assign admin role by default
        $adminRole = Role::where('name', 'Admin')->where('guard_name', 'tenant')->first();
        if ($adminRole) {
            $tenantUser->assignRole($adminRole);
        }

        tenancy()->end();

        event(new Registered($tenantUser));

        Auth::guard('web')->login($centralUser);

        tenancy()->initialize($tenant);

        Auth::guard('tenant')->login($tenantUser);
        
        return redirect()->route('dashboard', ['tenant' => $tenant->id]);
    }   
}
