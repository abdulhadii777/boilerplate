<?php

namespace App\Http\Controllers\Logging;

use App\Http\Controllers\Controller;
use App\Http\Requests\Logging\ActivityLogIndexRequest;
use App\Http\Resources\USer\UserResource;
use App\Models\TenantUser;
use App\Services\ActivityLogService;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function __construct(
        private ActivityLogService $activityLogService
    ) {}

    /**
     * Display a listing of activity logs with filtering
     */
    public function index(ActivityLogIndexRequest $request): Response
    {
        $filters = $request->validated();
        $logs = $this->activityLogService->getFilteredLogs($filters);

        return Inertia::render('activity-logs/index', [
            'logs' => $logs,
            'filters' => $filters,
            'availableFeatures' => $this->activityLogService->getAvailableFeatures(),
            'availableActions' => $this->activityLogService->getAvailableActions(),
            'availableUsers' => UserResource::collection(TenantUser::select('id', 'name', 'email')->get())->resolve(),
        ]);
    }
}
