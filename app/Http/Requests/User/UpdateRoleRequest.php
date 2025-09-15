<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'role_id.required' => 'Role is required.',
            'role_id.exists' => 'Selected role does not exist.',
        ];
    }
}
