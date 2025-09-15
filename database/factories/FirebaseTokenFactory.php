<?php

namespace Database\Factories;

use App\Models\FirebaseToken;
use App\Models\CentralUser;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FirebaseToken>
 */
class FirebaseTokenFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = FirebaseToken::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => CentralUser::factory(),
            'token' => 'fcm_token_'.$this->faker->unique()->sha1(),
            'device_type' => $this->faker->randomElement(['web', 'android', 'ios']),
            'device_name' => $this->faker->randomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
            'is_active' => true,
            'last_used_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }

    /**
     * Indicate that the token is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the token is for web device.
     */
    public function web(): static
    {
        return $this->state(fn (array $attributes) => [
            'device_type' => 'web',
            'device_name' => $this->faker->randomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
        ]);
    }

    /**
     * Indicate that the token is for mobile device.
     */
    public function mobile(): static
    {
        return $this->state(fn (array $attributes) => [
            'device_type' => $this->faker->randomElement(['android', 'ios']),
            'device_name' => $this->faker->randomElement(['Chrome Mobile', 'Safari Mobile', 'Firefox Mobile']),
        ]);
    }
}
