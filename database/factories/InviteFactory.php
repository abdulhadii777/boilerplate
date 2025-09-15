<?php

namespace Database\Factories;

use App\Models\Invite;
use App\Models\Role;
use App\Models\CentralUser;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invite>
 */
class InviteFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Invite::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => $this->faker->unique()->safeEmail(),
            'role_id' => Role::factory(),
            'token' => Str::random(64),
            'invited_by' => CentralUser::factory(),
            'expires_at' => $this->faker->dateTimeBetween('now', '+30 days'),
            'resent_count' => 0,
            'accepted_at' => null,
        ];
    }

    /**
     * Indicate that the invite has been accepted.
     */
    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'accepted_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Indicate that the invite has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => $this->faker->dateTimeBetween('-30 days', '-1 day'),
        ]);
    }

    /**
     * Indicate that the invite has been resent multiple times.
     */
    public function resent(int $count = 1): static
    {
        return $this->state(fn (array $attributes) => [
            'resent_count' => $count,
        ]);
    }
}
