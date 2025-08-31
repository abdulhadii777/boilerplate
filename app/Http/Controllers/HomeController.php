<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Show the welcome page or redirect authenticated users to their tenant dashboard.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        // If user is authenticated, redirect to their first available tenant dashboard
        if (Auth::check()) {
            $user = Auth::user();
            $tenantUser = $user->tenantUsers()->first();

            if ($tenantUser) {
                return redirect()->route('tenant.dashboard', ['tenant' => $tenantUser->tenant_id]);
            }
        }

        // Show welcome page for guests or users without tenants
        return Inertia::render('dashboard/welcome');
    }
}
