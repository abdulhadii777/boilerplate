import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import RoleCard from './role-card';
import { Role } from '../types';

interface RoleDescriptionsProps {
    roles: Role[];
}

export default function RoleDescriptions({ roles }: RoleDescriptionsProps) {
    const handleEditRole = () => {
        // TODO: Open edit role dialog
    };

    const handleDeleteRole = () => {
        if (confirm(`Are you sure you want to delete this role?`)) {
            // TODO: Delete role
        }
    };

    if (!roles || roles.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Role Descriptions</CardTitle>
                    <CardDescription>
                        Understanding what each role can do in your organization.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No roles found.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-4">Available Roles</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.name}
                            role={role}
                            onEdit={handleEditRole}
                            onDelete={handleDeleteRole}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
