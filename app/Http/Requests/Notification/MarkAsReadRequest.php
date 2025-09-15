<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class MarkAsReadRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'notification_id' => [
                'required',
                'string',
                'exists:notifications,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'notification_id.required' => 'Notification ID is required.',
            'notification_id.string' => 'Notification ID must be a string.',
            'notification_id.exists' => 'Notification not found.',
        ];
    }
}
