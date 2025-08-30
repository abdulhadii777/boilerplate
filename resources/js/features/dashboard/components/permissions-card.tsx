import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface PermissionsCardProps {
    permissions: {
        can_manage_users: boolean;
        can_manage_roles: boolean;
        can_view_analytics: boolean;
        can_manage_settings: boolean;
    };
}

export default function PermissionsCard({ permissions }: PermissionsCardProps) {
    return (
        <Card className="border-0 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardHeader>
                <CardTitle className="text-lg">Your Permissions</CardTitle>
                <CardDescription>What you can do in this organization</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${permissions.can_manage_users ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className="text-sm">Manage Users</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${permissions.can_manage_roles ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className="text-sm">Manage Roles</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${permissions.can_view_analytics ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className="text-sm">View Analytics</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${permissions.can_manage_settings ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className="text-sm">Manage Settings</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
