<?php

namespace App\Http\Requests\FirebaseToken;

use Illuminate\Foundation\Http\FormRequest;

class StoreFirebaseTokenRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'token' => [
                'required',
                'string',
                'max:500',
            ],
            'device_type' => [
                'nullable',
                'string',
                'max:50',
            ],
            'device_name' => [
                'nullable',
                'string',
                'max:100',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'Firebase token is required.',
            'token.string' => 'Firebase token must be a string.',
            'token.max' => 'Firebase token cannot exceed 500 characters.',
            'device_type.string' => 'Device type must be a string.',
            'device_type.max' => 'Device type cannot exceed 50 characters.',
            'device_name.string' => 'Device name must be a string.',
            'device_name.max' => 'Device name cannot exceed 100 characters.',
        ];
    }
}
