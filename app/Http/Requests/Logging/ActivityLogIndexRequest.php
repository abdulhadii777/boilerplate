<?php

namespace App\Http\Requests\Logging;

use Illuminate\Foundation\Http\FormRequest;

class ActivityLogIndexRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'feature' => ['nullable', 'string', 'max:255'],
            'action' => ['nullable', 'string', 'max:255'],
            'performed_by' => ['nullable', 'integer', 'exists:users,id'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:100'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'performed_by.exists' => 'The selected user does not exist.',
            'date_to.after_or_equal' => 'The end date must be after or equal to the start date.',
            'per_page.min' => 'The per page value must be at least 10.',
            'per_page.max' => 'The per page value must not exceed 100.',
        ];
    }
}
