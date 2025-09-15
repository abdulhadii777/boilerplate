<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'event_type' => [
                'required',
                'string',
            ],
            'email_enabled' => [
                'boolean',
            ],
            'push_enabled' => [
                'boolean',
            ],
            'in_app_enabled' => [
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'event_type.required' => 'Event type is required.',
            'event_type.string' => 'Event type must be a string.',
            'email_enabled.boolean' => 'Email enabled must be true or false.',
            'push_enabled.boolean' => 'Push enabled must be true or false.',
            'in_app_enabled.boolean' => 'In-app enabled must be true or false.',
        ];
    }
}
