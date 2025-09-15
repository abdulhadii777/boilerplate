import { RoleDialog } from '@/components/roles/role-dialog';
import { RoleList } from '@/components/roles/role-list';
import { RoleViewDialog } from '@/components/roles/role-view-dialog';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps, type Role } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface Props extends Omit<PageProps, 'roles'> {
    roles: Array<{
        id: number;
        name: string;
        description?: string;
        permissions_count: number;
        users_count: number;
        created_at: string;
        is_system: boolean; // Add this line
    }>;
    permissions: Array<{
        id: number;
        name: string;
        guard_name: string;
    }>;
}

export default function RolesIndex({ roles, permissions }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles',
            name: 'roles.index',
        },
    ];

    const handleView = (role: Role) => {
        setSelectedRole(role);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setIsEditDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedRole(null);
        setIsCreateDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />

            <div className="flex-1 space-y-4 p-4 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
                        <p className="text-muted-foreground">Manage user roles and their permissions</p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Role
                    </Button>
                </div>

                <RoleList roles={roles} onView={handleView} onEdit={handleEdit} />

                {/* Create Dialog */}
                <RoleDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} permissions={permissions} mode="create" />

                {/* Edit Dialog */}
                <RoleDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} role={selectedRole} permissions={permissions} mode="edit" />

                {/* View Dialog */}
                <RoleViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} role={selectedRole} />
            </div>
        </AppLayout>
    );
}
