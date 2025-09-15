<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLogService
{
    /**
     * Log an activity with deferred execution
     */
    public function log(string $feature, string $action, string $details, ?int $performedBy = null): void
    {
        // Use dispatch() to log after the request is completed
        dispatch(function () use ($feature, $action, $details, $performedBy) {
            $this->createLog($feature, $action, $details, $performedBy);
        })->afterResponse();
    }

    /**
     * Create the actual log entry
     */
    private function createLog(string $feature, string $action, string $details, ?int $performedBy = null): void
    {
        try {
            ActivityLog::create([
                'feature' => $feature,
                'action' => $action,
                'details' => $details,
                'performed_by' => $performedBy ?? Auth::id(),
                'performed_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Log to Laravel's default log if database logging fails
            Log::error('Failed to create activity log', [
                'feature' => $feature,
                'action' => $action,
                'details' => $details,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get filtered activity logs with pagination
     */
    public function getFilteredLogs(array $filters = []): LengthAwarePaginator
    {
        $query = ActivityLog::with('performer')
            ->latest('performed_at');

        // Apply filters
        if (! empty($filters['feature'])) {
            $query->forFeature($filters['feature']);
        }

        if (! empty($filters['action'])) {
            $query->forAction($filters['action']);
        }

        if (! empty($filters['performed_by'])) {
            $query->byUser($filters['performed_by']);
        }

        if (! empty($filters['date_from']) || ! empty($filters['date_to'])) {
            $dateFrom = $filters['date_from'] ?? '1900-01-01';
            $dateTo = $filters['date_to'] ?? now()->format('Y-m-d');
            $query->inDateRange($dateFrom, $dateTo);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('feature', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhere('details', 'like', "%{$search}%")
                    ->orWhereHas('performer', function ($performerQuery) use ($search) {
                        $performerQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }

    /**
     * Get all available features from activity logs
     */
    public function getAvailableFeatures(): array
    {
        return ActivityLog::distinct()
            ->pluck('feature')
            ->filter()
            ->sort()
            ->values()
            ->toArray();
    }

    /**
     * Get all available actions from activity logs
     */
    public function getAvailableActions(): array
    {
        return ActivityLog::distinct()
            ->pluck('action')
            ->filter()
            ->sort()
            ->values()
            ->toArray();
    }
}
