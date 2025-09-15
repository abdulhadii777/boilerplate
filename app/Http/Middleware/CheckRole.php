<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user() || ! $request->user()->hasRole($role)) {
            // For web requests, redirect with error message
            return redirect()->back()->with('error', 'You do not have the required role to perform this action.');
        }

        return $next($request);
    }
}
