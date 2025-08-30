<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        
        // Use the RoleManagementPolicy to check authorization
        return $user && $user->can('manage_roles');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:roles,name',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'name.unique' => 'A role with this name already exists.',
            'name.max' => 'Role name cannot exceed 255 characters.',
            'display_name.required' => 'Display name is required.',
            'display_name.max' => 'Display name cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'permissions.array' => 'Permissions must be an array.',
            'permissions.*.exists' => 'One or more selected permissions do not exist.',
        ];
    }
}
