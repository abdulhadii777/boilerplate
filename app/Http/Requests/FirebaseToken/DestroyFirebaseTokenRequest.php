<?php

namespace App\Http\Requests\FirebaseToken;

use Illuminate\Foundation\Http\FormRequest;

class DestroyFirebaseTokenRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'token' => [
                'required',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'Firebase token is required.',
            'token.string' => 'Firebase token must be a string.',
        ];
    }
}
