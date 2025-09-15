<?php

namespace Database\Seeders\Tenant;

use App\Models\NotificationSetting;
use App\Models\TenantUser;
use App\Services\NotificationService;
use Illuminate\Database\Seeder;

class NotificationSettingsSeeder extends Seeder
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating missing notification settings for existing users...');

        $users = TenantUser::all();

        if ($users->isEmpty()) {
            $this->command->info('No users found to create notification settings for.');

            return;
        }
        
        $bar = $this->command->getOutput()->createProgressBar($users->count());
        $bar->start();

        $totalCreated = 0;

        foreach ($users as $user) {
            $createdCount = $this->createMissingSettingsForUser($user);
            $totalCreated += $createdCount;
            $bar->advance();
        }

        $bar->finish();
        $this->command->newLine();
        $this->command->info("Created {$totalCreated} missing notification settings across {$users->count()} users.");
    }

    /**
     * Create only missing notification settings for a specific user
     */
    private function createMissingSettingsForUser(TenantUser $user): int
    {
        $availableEventTypes = NotificationSetting::getAvailableEventTypes();
        $existingEventTypes = $user->notificationSettings()
            ->pluck('event_type')
            ->toArray();

        $missingEventTypes = array_diff(array_keys($availableEventTypes), $existingEventTypes);

        if (empty($missingEventTypes)) {
            return 0;
        }

        $createdCount = 0;

        foreach ($missingEventTypes as $eventType) {
            NotificationSetting::create([
                'user_id' => $user->id,
                'event_type' => $eventType,
                'email_enabled' => true,
                'push_enabled' => true,
                'in_app_enabled' => true,
            ]);
            $createdCount++;
        }

        return $createdCount;
    }
}
