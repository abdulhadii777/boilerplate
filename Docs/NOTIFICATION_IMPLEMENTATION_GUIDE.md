# Notification Implementation Guide

This document provides a step-by-step guide for implementing notifications for new features in the Laravel application.

## Overview

The notification system follows a unified pattern with:
- **Events** - Single event class per entity type with action parameters
- **Listeners** - Single listener per entity type that handles all actions
- **Observers** - Model observers for automatic event dispatching
- **Notifications** - Single notification class per entity type with action-based content
- **Custom Mail Templates** - Uses NotificationMail for consistent email formatting

## Quick Start Template

When adding notifications for a new feature (e.g., Products), follow this template:

### 1. Create the Event Class

```php
// app/Events/ProductEvent.php
<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;

class ProductEvent
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public Product $product,
        public string $action, // 'created', 'updated', 'deleted', 'published', etc.
        public array $metadata = []
    ) {}
}
```

### 2. Create the Listener Class

```php
// app/Listeners/SendProductNotifications.php
<?php

namespace App\Listeners;

use App\Events\ProductEvent;
use App\Models\NotificationSetting;
use App\Notifications\ProductNotification;

class SendProductNotifications extends BaseNotificationListener
{
    public function handle(ProductEvent $event): void
    {
        // Get all users who have notifications enabled for this event type
        $subscriptions = NotificationSetting::where('event_type', "product_{$event->action}")
            ->where(function ($query) {
                $query->where('email_enabled', true)
                    ->orWhere('push_enabled', true)
                    ->orWhere('in_app_enabled', true);
            })
            ->with('user')
            ->get();

        foreach ($subscriptions as $subscription) {
            $user = $subscription->user;

            // Only send notifications to users who can perform the action
            if (!$this->shouldReceiveNotification($user, "product_{$event->action}", $event->product)) {
                continue;
            }

            // Send notification with user's preferred channels
            $channels = $this->getEnabledChannels($subscription);
            
            if (!empty($channels)) {
                $notification = new ProductNotification($event->product, $event->action, $event->metadata);
                $user->notify($notification);
            }
        }
    }
}
```

### 3. Create the Notification Class

```php
// app/Notifications/ProductNotification.php
<?php

namespace App\Notifications;

use App\Mail\NotificationMail;
use App\Models\Product;
use App\Models\NotificationSetting;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class ProductNotification extends Notification
{
    public function __construct(
        public Product $product,
        public string $action,
        public array $metadata = []
    ) {}

    public function via($notifiable): array
    {
        $channels = [];
        
        // Check user preferences for this event type
        $setting = NotificationSetting::getUserSettingsForEvent($notifiable->id, "product_{$this->action}");
        
        if ($setting) {
            if ($setting->isEmailEnabled()) {
                $channels[] = 'mail';
            }
            if ($setting->isPushEnabled()) {
                $channels[] = FcmChannel::class;
            }
            if ($setting->isInAppEnabled()) {
                $channels[] = 'database';
            }
        }
        
        return $channels;
    }

    public function toMail($notifiable): NotificationMail
    {
        $title = $this->getTitle();
        $message = $this->getMessage();
        $data = $this->buildData();
        $actionUrl = $this->getActionUrl();
        $actionText = $this->getActionText();

        return (new NotificationMail(
            title: $title,
            message: $message,
            data: $data,
            actionUrl: $actionUrl,
            actionText: $actionText,
            headerTitle: $this->getHeaderTitle(),
            headerSubtitle: $this->getHeaderSubtitle()
        ))
            ->to($notifiable->routeNotificationFor('mail'));
    }

    public function toArray($notifiable): array
    {
        $data = [
            'title' => $this->getTitle(),
            'message' => $this->getMessage(),
            'product_id' => (string) $this->product->id,
            'product_name' => $this->product->name,
            'event_type' => "product_{$this->action}",
            'timestamp' => now()->toISOString(),
        ];
        
        // Add action-specific data
        if ($this->action === 'updated') {
            $data['updated_fields'] = $this->metadata['updated_fields'] ?? [];
        }
        
        return $data;
    }

    public function toFcm($notifiable): FcmMessage
    {
        $clickAction = $this->action !== 'deleted' ? route('products.show', $this->product->id) : '';

        return FcmMessage::create()
            ->notification(FcmNotification::create()
                ->title($this->getTitle())
                ->body($this->getMessage())
            )
            ->data([
                'type' => "product_{$this->action}",
                'product_id' => (string) $this->product->id,
                'product_name' => $this->product->name,
                'click_action' => $clickAction,
                'timestamp' => now()->toISOString(),
            ]);
    }

    private function getTitle(): string
    {
        return match ($this->action) {
            'created' => 'Product Created',
            'updated' => 'Product Updated',
            'deleted' => 'Product Deleted',
            'published' => 'Product Published',
            default => 'Product Action',
        };
    }

    private function getMessage(): string
    {
        return match ($this->action) {
            'created' => "Product '{$this->product->name}' has been created.",
            'updated' => "Product '{$this->product->name}' has been updated.",
            'deleted' => "Product '{$this->product->name}' has been deleted.",
            'published' => "Product '{$this->product->name}' has been published.",
            default => "Product '{$this->product->name}' action performed.",
        };
    }

    private function buildData(): array
    {
        $data = [
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'action' => $this->action,
            'timestamp' => now()->toISOString(),
        ];

        // Add action-specific data
        if ($this->action === 'updated') {
            $data['updated_fields'] = $this->metadata['updated_fields'] ?? [];
        }

        return array_filter($data, fn ($value) => $value !== null);
    }

    private function getActionUrl(): ?string
    {
        if ($this->action === 'deleted') {
            return null;
        }

        return route('products.show', $this->product->id);
    }

    private function getActionText(): ?string
    {
        return match ($this->action) {
            'created' => 'View Product',
            'updated' => 'View Product',
            'published' => 'View Product',
            default => 'View Details',
        };
    }

    private function getHeaderTitle(): string
    {
        return match ($this->action) {
            'created', 'updated', 'deleted', 'published' => 'Product Update',
            default => 'Notification',
        };
    }

    private function getHeaderSubtitle(): string
    {
        return match ($this->action) {
            'created', 'updated', 'deleted', 'published' => 'Product has been updated',
            default => 'You have a new notification',
        };
    }
}
```

### 4. Create the Observer Class

```php
// app/Observers/ProductObserver.php
<?php

namespace App\Observers;

use App\Events\ProductEvent;
use App\Models\Product;

class ProductObserver
{
    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        event(new ProductEvent($product, 'created'));
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        event(new ProductEvent($product, 'updated'));
    }

    /**
     * Handle the Product "deleted" event.
     */
    public function deleted(Product $product): void
    {
        event(new ProductEvent($product, 'deleted'));
    }

    /**
     * Handle the Product "restored" event.
     */
    public function restored(Product $product): void
    {
        // Handle product restoration if needed
    }

    /**
     * Handle the Product "force deleted" event.
     */
    public function forceDeleted(Product $product): void
    {
        // Handle force deletion if needed
    }
}
```

### 5. Create the Policy Class

```php
// app/Policies/ProductPolicy.php
<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\CentralUser;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any products.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('View Product');
    }

    /**
     * Determine whether the user can view the product.
     */
    public function view(User $user, Product $product): bool
    {
        return $user->can('View Product');
    }

    /**
     * Determine whether the user can create products.
     */
    public function create(User $user): bool
    {
        return $user->can('Create Product');
    }

    /**
     * Determine whether the user can update the product.
     */
    public function update(User $user, Product $product): bool
    {
        return $user->can('Update Product');
    }

    /**
     * Determine whether the user can delete the product.
     */
    public function delete(User $user, Product $product): bool
    {
        return $user->can('Delete Product');
    }

    /**
     * Determine whether the user can publish the product.
     */
    public function publish(User $user, Product $product): bool
    {
        return $user->can('Publish Product');
    }
}
```

## Registration Steps

### 6. Register Observer in AppServiceProvider

```php
// app/Providers/AppServiceProvider.php
use App\Models\Product;
use App\Observers\ProductObserver;

public function boot(): void
{
    // ... existing observers
    Product::observe(ProductObserver::class);
}
```

**Note**: Event listeners are automatically discovered in Laravel 11+, so no manual registration in `EventServiceProvider` is needed. This prevents duplicate notifications.

### 7. Add to NotificationSetting Model

```php
// app/Models/NotificationSetting.php
public static function getAvailableEventTypes(): array
{
    return [
        // ... existing events
        
        // Product events
        'product_created' => 'Product Created',
        'product_updated' => 'Product Updated',
        'product_deleted' => 'Product Deleted',
        'product_published' => 'Product Published',
    ];
}
```

### 8. Add Permission Check to BaseNotificationListener

```php
// app/Listeners/BaseNotificationListener.php
protected function canManageProducts(User $user): bool
{
    return $user->can('Create Product') || $user->can('Update Product') || $user->can('Delete Product');
}

protected function shouldReceiveNotification(User $user, string $action, $resource = null): bool
{
    return match ($action) {
        // User actions - only users who can manage users should get notifications
        'user_invited', 'user_role_updated', 'user_disabled', 'user_enabled', 'user_deleted' => 
            $this->canManageUsers($user),

        // Role actions - only users who can modify roles should get notifications
        'role_created', 'role_updated', 'role_deleted' => 
            $this->canModifyRoles($user),

        // Invite actions - only users who can manage invites should get notifications
        'invite_sent', 'invite_cancelled', 'invite_resent' => 
            $this->canInviteUsers($user),
        
        // Product actions - only users who can manage products should get notifications
        'product_created', 'product_updated', 'product_deleted', 'product_published' => 
            $this->canManageProducts($user),
        
        default => false,
    };
}
```

## Custom Actions (Non-Model Events)

For actions that don't correspond to standard model events:

### In Your Service

```php
use App\Events\ProductEvent;

class ProductService
{
    public function approveProduct(Product $product, User $approver): void
    {
        // Business logic...
        $product->update(['status' => 'approved']);
        
        // Manually dispatch custom event
        event(new ProductEvent($product, 'approved', [
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]));
    }
}
```

## Testing

### Test Observer Dispatches Events

```php
// tests/Feature/ProductNotificationTest.php
Event::fake();
$product = Product::factory()->create();

Event::assertDispatched(ProductEvent::class, function ($event) use ($product) {
    return $event->product->id === $product->id && $event->action === 'created';
});
```

### Test Listener Sends Notifications

```php
Notification::fake();
event(new ProductEvent($product, 'created'));

Notification::assertSentTo($user, ProductNotification::class);
```

## Best Practices

### 1. Action Naming
- Use descriptive, consistent action names
- Use past tense for completed actions: `created`, `updated`, `deleted`
- Use present tense for ongoing actions: `publishing`, `processing`

### 2. Metadata Usage
- Include relevant context in metadata
- Keep metadata lightweight and focused
- Use metadata for action-specific data

### 3. Permission Checks
- Always check permissions before sending notifications
- Only notify users who can perform the action
- Use policies for consistent permission checking

### 4. Channel Selection
- Respect user preferences for notification channels
- Provide fallback to all channels if no preferences exist
- Ensure all channels receive consistent data

### 5. Error Handling
- Handle missing resources gracefully
- Log notification failures for debugging
- Use queues for better performance

## Common Patterns

### Bulk Operations

```php
public function bulkUpdateProducts(array $productIds, array $data): void
{
    $products = Product::whereIn('id', $productIds)->get();
    
    foreach ($products as $product) {
        $product->update($data);
        // Observer automatically dispatches event
    }
}
```

### Conditional Notifications

```php
public function updateProduct(Product $product, array $data): void
{
    $oldStatus = $product->status;
    $product->update($data);
    
    // Only notify if status changed
    if ($oldStatus !== $product->status) {
        event(new ProductEvent($product, 'status_changed', [
            'old_status' => $oldStatus,
            'new_status' => $product->status,
        ]));
    }
}
```

### User-Specific Notifications

```php
public function assignProductToUser(Product $product, User $user): void
{
    $product->update(['assigned_user_id' => $user->id]);
    
    // Notify the assigned user specifically
    $user->notify(new ProductNotification($product, 'assigned', [
        'assigned_by' => auth()->id(),
    ]));
}
```

## Troubleshooting

### Notifications Not Being Sent
1. Check if events are being dispatched
2. Verify listeners are registered in EventServiceProvider
3. Check user notification settings
4. Ensure proper permissions are in place
5. Check observer registration in AppServiceProvider

### Missing Notification Channels
1. Verify FCM configuration for push notifications
2. Check mail configuration for email notifications
3. Ensure database notifications table exists
4. Check user channel preferences

### Performance Issues
1. Use queues for notifications
2. Consider batching notifications for multiple users
3. Monitor database query performance in listeners
4. Use eager loading for related data

## Current Implementation Status

The following features are currently implemented with full notification support:

### ✅ Implemented Features
- **User Management** - User creation, role updates, enable/disable, deletion
- **Role Management** - Role creation, updates, deletion  
- **Invite Management** - Invite sending, cancellation, resending

### 📋 Implementation Checklist

When adding notifications for a new feature, ensure you complete all these steps:

- [ ] Create Event class
- [ ] Create Notification class (using NotificationMail)
- [ ] Create SendNotifications listener (extends BaseNotificationListener)
- [ ] Create Observer class
- [ ] Register observer in AppServiceProvider
- [ ] Add event types to NotificationSetting::getAvailableEventTypes()
- [ ] Add permission checks to BaseNotificationListener
- [ ] Create Policy class (if needed)
- [ ] Test event dispatching
- [ ] Test notification sending

## Key Differences from Standard Laravel

This implementation differs from standard Laravel notifications in several ways:

1. **Custom Mail Template** - Uses `NotificationMail` instead of `MailMessage`
2. **Unified Event Pattern** - Single event class per entity with action parameters
3. **Permission-Based Notifications** - Only users with relevant permissions receive notifications
4. **Automatic Activity Logging** - All events are automatically logged
5. **Queue Processing** - All listeners implement `ShouldQueue` for performance

This guide provides a complete template for implementing notifications for any new feature. Follow the steps in order and ensure all components are properly registered and tested.
