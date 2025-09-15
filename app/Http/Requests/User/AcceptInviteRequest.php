<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;


class AcceptInviteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'token' => [
                'required',
                'string',
                Rule::exists('invites', 'token'),
            ],
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'password' => [
                'sometimes',
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
            'tenant_id' => [
                'required',
                'string',
            ],
            'role_id' => [
                'required',
                'integer',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'Invitation token is required.',
            'token.exists' => 'Invalid invitation token.',
            'name.required' => 'Name is required for new users.',
            'name.string' => 'Name must be a valid string.',
            'name.max' => 'Name must not exceed 255 characters.',
            'password.required' => 'Password is required for new users.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'tenant_id.required' => 'Tenant ID is required.',
            'tenant_id.string' => 'Invalid tenant ID.', 
            'role_id.required' => 'Role ID is required.',
            'role_id.integer' => 'Invalid role ID.',
        ];
    }
}
