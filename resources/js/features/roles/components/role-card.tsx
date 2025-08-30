import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Shield, Users, Settings, BarChart3, UserCheck, UserX, Crown, Edit, Trash2 } from 'lucide-react';
import { Role } from '../types';

interface RoleCardProps {
    role: Role;
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
}

export default function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
    const getRoleIcon = (roleName: string) => {
        switch (roleName) {
            case 'owner':
                return <Crown className="h-5 w-5" />;
            case 'admin':
                return <Shield className="h-5 w-5" />;
            case 'member':
                return <Users className="h-5 w-5" />;
            default:
                return <Shield className="h-5 w-5" />;
        }
    };

    const getRoleVariant = (roleName: string) => {
        switch (roleName) {
            case 'owner':
                return 'default';
            case 'admin':
                return 'secondary';
            case 'member':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getPermissionIcon = (permission: string) => {
        switch (permission) {
            case 'view_dashboard':
                return <BarChart3 className="h-3 w-3" />;
            case 'manage_users':
                return <Users className="h-3 w-3" />;
            case 'manage_roles':
                return <Shield className="h-3 w-3" />;
            case 'view_analytics':
                return <BarChart3 className="h-3 w-3" />;
            case 'manage_settings':
                return <Settings className="h-3 w-3" />;
            case 'grant_roles':
                return <UserCheck className="h-3 w-3" />;
            case 'revoke_roles':
                return <UserX className="h-3 w-3" />;
            case 'manage_owner_roles':
                return <Crown className="h-3 w-3" />;
            default:
                return <Shield className="h-3 w-3" />;
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        {getRoleIcon(role.name)}
                        <div>
                            <CardTitle className="text-lg">{role.display_name}</CardTitle>
                            <Badge variant={getRoleVariant(role.name)} className="text-xs">
                                {role.permission_count} permissions
                            </Badge>
                        </div>
                    </div>
                    <div className="flex space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(role)}
                            className="h-8 w-8 p-0"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        {role.name !== 'owner' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(role)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    {role.description}
                </p>
                
                {role.permissions.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            Permissions:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {role.permissions.map((permission) => (
                                <div
                                    key={permission}
                                    className="flex items-center space-x-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
                                >
                                    {getPermissionIcon(permission)}
                                    <span>{permission.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
