# Activity Logging Implementation Guide

This guide explains how to add activity logging to new features in the Laravel application.

## Overview

The activity logging system automatically tracks user actions across the application. It uses Laravel's event system with deferred queue processing to ensure performance and reliability.

## Architecture

```
User Action → Model Observer → Event → Event Listener → Activity Log Service → Database
```

### Components

1. **Model Observers** - Detect model changes
2. **Events** - Carry action data
3. **Event Listeners** - Process events and create logs
4. **ActivityLogService** - Handles log creation with queue processing
5. **ActivityLog Model** - Stores log entries

## Quick Start

### 1. Create an Event

```php
<?php

namespace App\Events;

use App\Models\YourModel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;

class YourModelEvent
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public YourModel $model,
        public string $action, // 'created', 'updated', 'deleted', etc.
        public array $metadata = []
    ) {}
}
```

### 2. Create an Event Listener

```php
<?php

namespace App\Listeners;

use App\Events\YourModelEvent;
use App\Services\ActivityLogService;

class LogYourModelActivity
{
    public function __construct(
        private ActivityLogService $activityLogService
    ) {}

    public function handle(YourModelEvent $event): void
    {
        $model = $event->model;
        $action = $event->action;
        $metadata = $event->metadata;

        switch ($action) {
            case 'created':
                $details = "{$model->name} was created on " . now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('YourModel', 'Create', $details);
                break;

            case 'updated':
                $details = "{$model->name} was updated on " . now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('YourModel', 'Update', $details);
                break;

            case 'deleted':
                $details = "{$model->name} was deleted on " . now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('YourModel', 'Delete', $details);
                break;

            default:
                $details = "{$model->name} - {$action} on " . now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('YourModel', ucfirst(str_replace('_', ' ', $action)), $details);
                break;
        }
    }
}
```

### 3. Create a Model Observer

```php
<?php

namespace App\Observers;

use App\Events\YourModelEvent;
use App\Models\YourModel;

class YourModelObserver
{
    public function created(YourModel $model): void
    {
        event(new YourModelEvent($model, 'created'));
    }

    public function updated(YourModel $model): void
    {
        event(new YourModelEvent($model, 'updated'));
    }

    public function deleted(YourModel $model): void
    {
        event(new YourModelEvent($model, 'deleted'));
    }
}
```

### 4. Register the Observer

In `app/Providers/AppServiceProvider.php`:

```php
use App\Models\YourModel;
use App\Observers\YourModelObserver;

public function boot(): void
{
    // ... existing observers
    YourModel::observe(YourModelObserver::class);
}
```

**Note**: Event listeners are automatically discovered in Laravel 11+, so no manual registration in `EventServiceProvider` is needed. This prevents duplicate notifications.

## Advanced Examples

### Custom Actions with Metadata

```php
// In your observer
public function updated(YourModel $model): void
{
    // Check for specific field changes
    if ($model->wasChanged('status')) {
        $oldStatus = $model->getOriginal('status');
        $newStatus = $model->status;
        
        event(new YourModelEvent($model, 'status_changed', [
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]));
    }
}

// In your listener
case 'status_changed':
    $oldStatus = $metadata['old_status'];
    $newStatus = $metadata['new_status'];
    $details = "{$model->name} status changed from {$oldStatus} to {$newStatus} on " . now()->format('M j, Y \a\t g:i A');
    $this->activityLogService->log('YourModel', 'Status Change', $details);
    break;
```

### Manual Activity Logging

For actions that don't involve model changes:

```php
use App\Services\ActivityLogService;

// In your controller or service
public function someAction()
{
    // ... perform action
    
    // Log the activity
    app(ActivityLogService::class)->log(
        feature: 'YourFeature',
        action: 'Custom Action',
        details: 'User performed custom action on ' . now()->format('M j, Y \a\t g:i A'),
        performedBy: auth()->id()
    );
}
```

### Complex Business Logic Logging

```php
public function handle(YourModelEvent $event): void
{
    $model = $event->model;
    $action = $event->action;
    $metadata = $event->metadata;

    switch ($action) {
        case 'bulk_import':
            $count = $metadata['imported_count'] ?? 0;
            $details = "Bulk import completed: {$count} records imported on " . now()->format('M j, Y \a\t g:i A');
            $this->activityLogService->log('YourModel', 'Bulk Import', $details);
            break;

        case 'export':
            $format = $metadata['format'] ?? 'unknown';
            $count = $metadata['exported_count'] ?? 0;
            $details = "Data exported in {$format} format: {$count} records on " . now()->format('M j, Y \a\t g:i A');
            $this->activityLogService->log('YourModel', 'Export Data', $details);
            break;
    }
}
```

## Best Practices

### 1. Naming Conventions

- **Events**: `{ModelName}Event` (e.g., `UserEvent`, `ProductEvent`)
- **Listeners**: `Log{ModelName}Activity` (e.g., `LogUserActivity`, `LogProductActivity`)
- **Observers**: `{ModelName}Observer` (e.g., `UserObserver`, `ProductObserver`)

### 2. Feature Names

Use consistent feature names in activity logs:
- `User` - for user-related actions
- `Role` - for role management
- `Product` - for product management
- `Order` - for order processing
- etc.

### 3. Action Names

Use clear, descriptive action names:
- `Create`, `Update`, `Delete` - for basic CRUD
- `Enable`, `Disable` - for status changes
- `Import`, `Export` - for data operations
- `Assign`, `Remove` - for relationships

### 4. Details Format

Always include:
- What was affected (model name, ID, or description)
- What action was performed
- When it happened (formatted timestamp)
- Additional context when relevant

Example:
```php
$details = "User {$user->name} ({$user->email}) was assigned role '{$role->name}' on " . now()->format('M j, Y \a\t g:i A');
```

### 5. Performance Considerations

- The `ActivityLogService` uses deferred queue processing
- Logs are created after the request completes
- Failed logs are written to Laravel's default log
- No impact on user experience

## Testing Activity Logs

### Create Test Events

```php
// In a test or tinker
use App\Events\YourModelEvent;
use App\Models\YourModel;

$model = YourModel::first();
event(new YourModelEvent($model, 'test_action'));

// Process the queue
php artisan queue:work --once
```

### Verify Logs

```php
use App\Models\ActivityLog;

// Check count
ActivityLog::count();

// View recent logs
ActivityLog::latest()->take(5)->get(['feature', 'action', 'details']);
```

## Database Schema

The `activity_logs` table structure:

```sql
CREATE TABLE activity_logs (
    id BIGINT PRIMARY KEY,
    feature VARCHAR(255),           -- e.g., 'User', 'Role', 'Product'
    action VARCHAR(255),            -- e.g., 'Create', 'Update', 'Delete'
    details TEXT,                   -- Detailed description
    performed_by BIGINT NULL,       -- User ID who performed the action
    performed_at TIMESTAMP,         -- When the action occurred
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_feature_action (feature, action),
    INDEX idx_performed_by (performed_by),
    INDEX idx_performed_at (performed_at)
);
```

## Troubleshooting

### No Activity Logs Created

1. **Check Event Registration**: Ensure events are registered in `EventServiceProvider`
2. **Check Observer Registration**: Verify observers are registered in `AppServiceProvider`
3. **Check Queue Processing**: Run `php artisan queue:work --once`
4. **Check Laravel Logs**: Look for errors in `storage/logs/laravel.log`

### Performance Issues

1. **Queue Processing**: Ensure queue workers are running
2. **Database Indexes**: Verify indexes exist on `activity_logs` table
3. **Log Volume**: Consider archiving old logs if volume is high

### Missing Data

1. **User Context**: Ensure `performed_by` is set correctly
2. **Model Relationships**: Check if related models are loaded
3. **Event Metadata**: Verify metadata is passed correctly

## Examples in Codebase

### Existing Implementations

- **User Events**: `app/Events/UserEvent.php`, `app/Listeners/LogUserActivity.php`
- **Role Events**: `app/Events/RoleEvent.php`, `app/Listeners/LogRoleActivity.php`
- **Invite Events**: `app/Events/InviteEvent.php`, `app/Listeners/LogInviteActivity.php`

### Service Usage

```php
// In any service or controller
use App\Services\ActivityLogService;

$activityLogService = app(ActivityLogService::class);
$activityLogService->log('Feature', 'Action', 'Details', $userId);
```

## Conclusion

This activity logging system provides comprehensive tracking of user actions across the application. By following this guide, you can easily add logging to new features while maintaining consistency and performance.

For questions or issues, refer to the existing implementations or consult the development team.
