import { BarChart3, Settings, Shield, Users } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface QuickActionsProps {
    tenant: {
        id: string;
    };
    permissions: {
        can_manage_users: boolean;
        can_manage_roles: boolean;
        can_view_analytics: boolean;
        can_manage_settings: boolean;
    };
}

export default function QuickActions({ tenant, permissions }: QuickActionsProps) {
    return (
        <Card className="border-0 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Manage your organization</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                    {permissions.can_manage_roles && (
                        <Button variant="outline" className="justify-start h-auto p-4" asChild>
                            <a href={`/t/${tenant.id}/roles`}>
                                <Shield className="mr-3 h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Manage Roles</div>
                                    <div className="text-xs text-muted-foreground">Configure user permissions</div>
                                </div>
                            </a>
                        </Button>
                    )}
                    
                    {permissions.can_manage_users && (
                        <Button variant="outline" className="justify-start h-auto p-4" disabled>
                            <Users className="mr-3 h-4 w-4" />
                            <div className="text-left">
                                <div className="font-medium">Manage Users</div>
                                <div className="text-xs text-muted-foreground">Add and remove members</div>
                            </div>
                        </Button>
                    )}
                    
                    {permissions.can_view_analytics && (
                        <Button variant="outline" className="justify-start h-auto p-4" disabled>
                            <BarChart3 className="mr-3 h-4 w-4" />
                            <div className="text-left">
                                <div className="font-medium">View Analytics</div>
                                <div className="text-xs text-muted-foreground">Monitor organization metrics</div>
                            </div>
                        </Button>
                    )}
                    
                    {permissions.can_manage_settings && (
                        <Button variant="outline" className="justify-start h-auto p-4" disabled>
                            <Settings className="mr-3 h-4 w-4" />
                            <div className="text-left">
                                <div className="font-medium">Organization Settings</div>
                                <div className="text-xs text-muted-foreground">Configure preferences</div>
                            </div>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
