<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInviteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'emails' => [
                'required',
                'string',
                'max:2000',
            ],
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id'),
            ],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $emails = array_filter(array_map('trim', explode(',', $this->input('emails'))));

            if (empty($emails)) {
                $validator->errors()->add('emails', 'At least one email address is required.');

                return;
            }

            if (count($emails) > 50) {
                $validator->errors()->add('emails', 'You can only invite up to 50 users at once.');

                return;
            }

            foreach ($emails as $index => $email) {
                if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $validator->errors()->add('emails', "Invalid email format: {$email}");
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'emails.required' => 'At least one email is required.',
            'emails.max' => 'Email list is too long.',
            'role_id.required' => 'Role is required.',
            'role_id.exists' => 'Selected role does not exist.',
        ];
    }
}
