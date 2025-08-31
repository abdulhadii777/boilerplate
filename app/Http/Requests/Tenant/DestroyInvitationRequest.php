<?php

namespace App\Http\Requests\Tenant;

use App\Services\PermissionService;
use Illuminate\Foundation\Http\FormRequest;

class DestroyInvitationRequest extends FormRequest
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
        $invitation = $this->route('invitation');

        // Check if user has the permission to remove users/invitations
        $canRemoveUsers = $this->permissionService->userHasPermission($user->id, $tenantId, 'remove_users');

        return $tenantId && $user && $canRemoveUsers && $invitation->tenant_id === $tenantId;
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
