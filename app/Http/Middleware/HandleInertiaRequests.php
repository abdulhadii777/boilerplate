<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\TenantUser;
use App\Models\CentralUser;
use App\Models\Tenant;
use App\Services\BusinessService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        $unreadCount = 0;
        $notifications = [];
        $tenantId = tenancy()->tenant?->id;
        $businesses = [];
        $currentBusiness = null;
        if( $user){
            if ($tenantId && $user instanceof CentralUser) {
                $centralUser = $user;
                $user = Auth::guard('tenant')->user();
            }
            else{
                $centralUser = Auth::guard('web')->user();
            }
        
            $businessService = app(BusinessService::class);
            $tenants = $businessService->getUserTenants($centralUser);
            $businesses = $tenants->map(function ($tenant) use ($tenantId) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'is_current' => $tenant->id === $tenantId,
                    'is_favorite' => $tenant->pivot->is_favorite ?? false,
                ];
            })->toArray();
            
            // Set current business
            if ($tenantId) {
                $currentBusiness = $tenants->firstWhere('id', $tenantId);
            }

            // Fetch notifications for tenant users
            if ($user instanceof TenantUser) {
                $notificationService = app(NotificationService::class);
                $unreadCount = $notificationService->getUnreadCount($user);
                
                // Get paginated notifications (first 10)
                $notifications = $user->notifications()
                    ->orderBy('created_at', 'desc')
                    ->paginate(10, ['*'], 'page', 1)
                    ->toArray();
            }
        }
        
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'auth' => [
                'user' => $user,
                'permissions' => $user && $user instanceof TenantUser ? $user->getAllPermissions()->pluck('name')->toArray() : [],
                'roles' => $user && $user instanceof TenantUser ? $user->getRoleNames()->toArray() : [],
            ],
            'businesses' => $businesses,
            'currentBusiness' => $currentBusiness ? [
                'id' => $currentBusiness->id,
                'name' => $currentBusiness->name,
            ] : null,
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'unreadCount' => $unreadCount,
            'notifications' => $notifications,
            'pwa' => [
                'blocked' => (bool) $request->cookie('pwa.install.never'),
                'snoozed' => (bool) $request->cookie('pwa.install.snooze'),
            ],
        ];
        
    }
}
