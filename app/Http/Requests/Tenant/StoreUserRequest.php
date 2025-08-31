<?php

namespace App\Http\Requests\Tenant;

use App\Services\PermissionService;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function __construct(
        private PermissionService $permissionService
    ) {}

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $tenantId = tenant('id');

        // Check if user has the permission to invite users
        $canInviteUsers = $this->permissionService->userHasPermission($user->id, $tenantId, 'can_invite_users');

        return $user && $canInviteUsers;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'invitations' => ['required', 'array', 'min:1', 'max:10'],
            'invitations.*.email' => ['required', 'email', 'max:255'],
            'invitations.*.role' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'invitations.required' => 'At least one invitation is required.',
            'invitations.min' => 'At least one invitation is required.',
            'invitations.max' => 'You can only invite up to 10 users at once.',
            'invitations.*.email.required' => 'Email is required for each invitation.',
            'invitations.*.email.email' => 'Please provide a valid email address.',
            'invitations.*.role.required' => 'Role is required for each invitation.',
        ];
    }
}
