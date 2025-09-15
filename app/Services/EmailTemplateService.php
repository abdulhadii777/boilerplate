<?php

namespace App\Services;

class EmailTemplateService
{
    public function getInviteTemplateData(): array
    {
        // Dummy data for preview
        return [
            'invitedBy' => 'John Doe',
            'roleName' => 'Senior Developer',
            'acceptUrl' => '#',
            'additionalInfo' => 'You\'ll be working on our flagship product and collaborating with a team of 15 developers.',
        ];
    }

    public function renderInviteTemplate(array $data): string
    {
        return view('emails.invite', [
            'headerTitle' => 'You\'re Invited!',
            'headerSubtitle' => 'Join our team and start collaborating',
            'invitedBy' => $data['invitedBy'],
            'roleName' => $data['roleName'],
            'acceptUrl' => $data['acceptUrl'],
            'additionalInfo' => $data['additionalInfo'] ?? null,
        ])->render();
    }
}
