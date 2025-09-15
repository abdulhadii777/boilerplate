<?php

namespace App\Http\Requests\Business;

use Illuminate\Foundation\Http\FormRequest;

class StoreTenantRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Business name is required.',
            'name.string' => 'Business name must be a string.',
            'name.max' => 'Business name must not exceed 255 characters.',
            'name.min' => 'Business name must be at least 2 characters.',
        ];
    }
}
