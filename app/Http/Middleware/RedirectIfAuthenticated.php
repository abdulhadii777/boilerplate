<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\RedirectIfAuthenticated as BaseRedirectIfAuthenticated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\TenantUser;

class RedirectIfAuthenticated extends BaseRedirectIfAuthenticated
{
    protected function redirectTo(Request $request, $guard = null): ?string
    {
        $user = Auth::user();
        
        if ($user && $user->tenants()->count() > 0) {
            $tenant = $user->tenants->first();
            tenancy()->initialize($tenant);            
            $tenantUser = TenantUser::where('global_id', $user->global_id)->first();
            Auth::guard('tenant')->login($tenantUser);

            return route('dashboard', ['tenant' => $tenant->id]);
        }
        else{
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // return a response that clears the cookie
            return redirect()
                ->route('login')
                ->withCookie(cookie()->forget(config('session.cookie')));
        }

    }
}
