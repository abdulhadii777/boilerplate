<?php

use App\Models\CentralUser;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = CentralUser::factory()->create());

    $this->get('/dashboard')->assertOk();
});
