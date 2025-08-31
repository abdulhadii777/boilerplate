<?php

namespace App\Http\Requests\Tenant;

use App\Services\PermissionService;
use Illuminate\Foundation\Http\FormRequest;

class DestroyUserRequest extends FormRequest
{
    public function __construct(
        private PermissionService $permissionService
    ) {}

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $tenantId = tenant('id');
        $user = $this->user();
        $tenantUser = $this->route('tenantUser');

        // Check if user has the permission to remove users
        $canRemoveUsers = $this->permissionService->userHasPermission($user->id, $tenantId, 'remove_users');

        // Check if user can manage the target user
        $userRole = $user->getTenantRole($tenantId);
        $targetRole = $tenantUser->role;

        // Owner can manage anyone, admin can manage anyone except owner
        $canManageTarget = $userRole === 'owner' ||
                          ($userRole === 'admin' && $targetRole !== 'owner');

        return $tenantId && $user && $canRemoveUsers && $canManageTarget &&
               $tenantUser->tenant_id === $tenantId;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }
}
