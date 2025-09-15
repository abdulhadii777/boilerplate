<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($this->route('role')),
            ],
            'description' => ['nullable', 'string', 'max:250'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'name.unique' => 'Role name must be unique.',
            'permissions.required' => 'At least one permission is required.',
            'permissions.min' => 'At least one permission must be selected.',
        ];
    }
}
