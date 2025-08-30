import { BarChart3, Settings, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface StatsGridProps {
    stats: {
        total_users: number;
        total_roles: number;
        total_permissions: number;
    };
}

export default function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total_users}</div>
                    <p className="text-xs text-muted-foreground">Active organization members</p>
                </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Roles</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total_roles}</div>
                    <p className="text-xs text-muted-foreground">Available user roles</p>
                </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Permissions</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total_permissions}</div>
                    <p className="text-xs text-muted-foreground">System permissions</p>
                </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">100%</div>
                    <p className="text-xs text-muted-foreground">System health</p>
                </CardContent>
            </Card>
        </div>
    );
}
