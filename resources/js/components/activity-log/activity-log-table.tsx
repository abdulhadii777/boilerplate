import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActivityLog } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Activity, Calendar, User } from 'lucide-react';

interface ActivityLogTableProps {
    logs: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
        first_page_url: string;
        from: number;
        last_page_url: string;
        next_page_url: string | null;
        path: string;
        prev_page_url: string | null;
        to: number;
    };
    isLoading?: boolean;
}

export function ActivityLogTable({ logs, isLoading = false }: ActivityLogTableProps) {
    if (isLoading) {
        return <ActivityLogTableSkeleton />;
    }

    if (logs.data.length === 0) {
        return (
            <div className="py-8 text-center">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">No activity logs found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters to see more results.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Feature</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Performed By</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.data.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>
                                    <Badge variant="secondary" className="font-medium">
                                        {log.feature}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{log.action}</Badge>
                                </TableCell>
                                <TableCell className="max-w-md">
                                    <p className="line-clamp-2 text-sm text-muted-foreground">{log.details}</p>
                                </TableCell>
                                <TableCell>
                                    {log.performer ? (
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">{log.performer.name}</p>
                                                <p className="text-xs text-muted-foreground">{log.performer.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">System</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{format(new Date(log.performed_at), 'MMM d, yyyy')}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(log.performed_at), 'h:mm a')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(log.performed_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {logs.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {logs.from} to {logs.to} of {logs.total} results
                    </div>
                    <div className="flex items-center gap-2">
                        {logs.links.map((link, index) => {
                            if (index === 0) {
                                // Previous button
                                return (
                                    <Button
                                        key="prev"
                                        variant="outline"
                                        size="sm"
                                        disabled={!logs.prev_page_url}
                                        onClick={() => {
                                            if (logs.prev_page_url) {
                                                window.location.href = logs.prev_page_url;
                                            }
                                        }}
                                    >
                                        Previous
                                    </Button>
                                );
                            } else if (index === logs.links.length - 1) {
                                // Next button
                                return (
                                    <Button
                                        key="next"
                                        variant="outline"
                                        size="sm"
                                        disabled={!logs.next_page_url}
                                        onClick={() => {
                                            if (logs.next_page_url) {
                                                window.location.href = logs.next_page_url;
                                            }
                                        }}
                                    >
                                        Next
                                    </Button>
                                );
                            } else if (link.label !== '...') {
                                // Page numbers
                                return (
                                    <Button
                                        key={link.label}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            if (link.url) {
                                                window.location.href = link.url;
                                            }
                                        }}
                                    >
                                        {link.label}
                                    </Button>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function ActivityLogTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Feature</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Performed By</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Skeleton className="h-6 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-6 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-full max-w-md" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
