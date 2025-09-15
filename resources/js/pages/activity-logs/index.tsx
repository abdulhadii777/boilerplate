import { ActivityLogFiltersComponent } from '@/components/activity-log/activity-log-filters';
import { ActivityLogTable } from '@/components/activity-log/activity-log-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { ActivityLogFilters, ActivityLogPageProps, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Filter, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { type MainPageProps } from '@/types';
import { useTenantRoute } from '@/utils/tenantRoute';

export default function ActivityLogsIndex({ logs, filters, availableFeatures, availableActions, availableUsers }: ActivityLogPageProps) {
    const [isFiltering, setIsFiltering] = useState(false);
    
    const tenantRoute = useTenantRoute()
    const handleFilterChange = (newFilters: ActivityLogFilters) => {
        setIsFiltering(true);
        router.get(tenantRoute('activity-logs.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsFiltering(false),
        });
    };

    const handleRefresh = () => {
        setIsFiltering(true);
        router.reload({
            onFinish: () => setIsFiltering(false),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Activity Logs',
            name: 'activity-logs.index',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />

            <div className="flex-1 space-y-4 p-4 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                        <p className="text-muted-foreground">View and filter system activity logs</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFiltering}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isFiltering ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Compact Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <ActivityLogFiltersComponent
                            filters={filters}
                            availableFeatures={availableFeatures}
                            availableActions={availableActions}
                            availableUsers={availableUsers}
                            onFiltersChange={handleFilterChange}
                            isLoading={isFiltering}
                        />
                    </CardContent>
                </Card>

                {/* Results */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Activity Logs
                            {logs.total > 0 && (
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({logs.total} {logs.total === 1 ? 'entry' : 'entries'})
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ActivityLogTable logs={logs} isLoading={isFiltering} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
