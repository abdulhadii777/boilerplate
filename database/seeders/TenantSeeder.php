<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\Tenant\RolePermissionSeeder;
use Database\Seeders\Tenant\NotificationSettingsSeeder;

class TenantSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            NotificationSettingsSeeder::class,
        ]);
    }
}
