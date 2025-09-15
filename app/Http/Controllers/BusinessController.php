<?php

namespace App\Http\Controllers;

use App\Http\Requests\Business\StoreTenantRequest;
use App\Http\Requests\Business\UpdateTenantRequest;
use App\Http\Resources\Business\TenantResource;
use App\Models\Tenant;
use App\Services\BusinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    public function __construct(
        private BusinessService $businessService
    ) {}

    /**
     * Display the business dashboard with tenant list
     */
    public function index(): Response
    {
        $centralUser = Auth::guard('web')->user();
        $tenants = $this->businessService->getUserTenants($centralUser);
        
        return Inertia::render('business/index', [
            'tenants' => TenantResource::collection($tenants)->resolve(),
        ]);
    }

    /**
     * Store a newly created tenant
     */
    public function store(StoreTenantRequest $request): RedirectResponse
    {
        $tenant = $this->businessService->createTenant(
            Auth::guard('web')->user(),
            $request->validated('name')
        );

        return redirect()->route('business.index')
            ->with('success', "Business '{$tenant->name}' created successfully.");
    }

    /**
     * Switch to a specific tenant
     */
    public function switch(Request $request, string $tenantId): RedirectResponse
    {
        $tenant = Tenant::findOrFail($tenantId);

        $this->businessService->switchToTenant(Auth::guard('web')->user(), $tenant);

        return redirect()->route('dashboard', ['tenant' => $tenant->id]);
    }

    /**
     * Update the specified tenant
     */
    public function update(UpdateTenantRequest $request, string $tenantId): RedirectResponse
    {
        $tenant = Tenant::findOrFail($tenantId);

        $this->businessService->updateTenant($tenant, $request->validated('name'));

        return redirect()->route('business.index')
            ->with('success', "Business '{$tenant->name}' updated successfully.");
    }

    /**
     * Remove the specified tenant
     */
    public function destroy(string $tenantId): RedirectResponse
    {
        $tenant = Tenant::findOrFail($tenantId);

        $this->businessService->deleteTenant($tenant);

        return redirect()->route('business.index')
            ->with('success', "Business '{$tenant->name}' deleted successfully.");
    }

    /**
     * Toggle favorite status for a business
     */
    public function toggleFavorite(Request $request, string $tenantId): RedirectResponse
    {
        $tenant = Tenant::findOrFail($tenantId);
        $centralUser = Auth::guard('web')->user();

        if (!$centralUser) {
            return redirect()->back()->with('error', 'User not authenticated.');
        }

        try {
            $this->businessService->toggleFavoriteBusiness($centralUser, $tenant);
            
            $message = $this->businessService->isFavoriteBusiness($centralUser, $tenant)
                ? "Business '{$tenant->name}' added to favorites."
                : "Business '{$tenant->name}' removed from favorites.";

            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
