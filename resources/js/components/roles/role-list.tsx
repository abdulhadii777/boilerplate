import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDate } from '@/utils/date';
import { router } from '@inertiajs/react';
import { Copy, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTenantRoute } from '@/utils/tenantRoute';

interface Role {
    id: number;
    name: string;
    description?: string;
    permissions_count: number;
    users_count: number;
    created_at: string;
    is_system: boolean;
}

interface Props {
    roles: Role[];
    onView: (role: Role) => void;
    onEdit: (role: Role) => void;
}

export function RoleList({ roles, onView, onEdit }: Props) {

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);    
    const tenantRoute = useTenantRoute()

    const handleDelete = (role: Role) => {
        // Prevent deletion of system roles
        if (role.is_system) {
            return;
        }
        setRoleToDelete(role);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (roleToDelete) {
            router.delete(tenantRoute('roles.destroy', { role: roleToDelete.id }));
            setDeleteDialogOpen(false);
            setRoleToDelete(null);
        }
    };

    const handleCopy = (role: Role) => {
        // Prevent copying of system roles
        if (role.is_system) {
            return;
        }
        router.post(tenantRoute('roles.copy', {role: role.id }));
    };

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles && roles.length > 0 ? (
                    roles.map((role) => (
                        <Card key={role.id} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <h3 className="text-lg font-semibold">{role.name}</h3>
                                            {role.is_system && (
                                                <Badge variant="secondary" className="text-xs">
                                                    System
                                                </Badge>
                                            )}
                                        </div>
                                        {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onView(role)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </DropdownMenuItem>
                                            {!role.is_system && (
                                                <DropdownMenuItem onClick={() => onEdit(role)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                            )}
                                            {!role.is_system && (
                                                <DropdownMenuItem onClick={() => handleCopy(role)}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy Role
                                                </DropdownMenuItem>
                                            )}
                                            {!role.is_system && (
                                                <DropdownMenuItem onClick={() => handleDelete(role)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Permissions</span>
                                        <span className="font-medium">{role.permissions_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Users</span>
                                        <span className="font-medium">{role.users_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Created</span>
                                        <span className="font-medium">{formatDate(role.created_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                        {roles === undefined ? 'Loading...' : 'No roles found'}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>Are you sure you want to delete "{roleToDelete?.name}"? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
