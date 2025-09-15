import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NoData } from '@/components/ui/no-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmationDialog } from '@/components/users/confirmation-dialog';
import { EditRoleDialog } from '@/components/users/edit-role-dialog';
import { UserDetailsDialog } from '@/components/users/user-details-dialog';
import { useAuthorization } from '@/hooks/useAuthorization';
import { MainPageProps, type SimpleRole, type User } from '@/types';
import { formatDate } from '@/utils/date';
import { useTenantRoute } from '@/utils/tenantRoute';
import { router, usePage } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, Trash2, UserX } from 'lucide-react';
import { useState } from 'react';

interface Props {
    users: User[];
    roles: SimpleRole[];
    status: string;
}

export function UserTable({ users, roles, status }: Props) {
    const { hasPermission } = useAuthorization();
    const { auth } = usePage<MainPageProps>().props;
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionType, setActionType] = useState<string>('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showEditRole, setShowEditRole] = useState(false);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const tenantRoute = useTenantRoute()
    const canEditRole = hasPermission('Manage User');
    const canDelete = hasPermission('Manage User');
    const canView = hasPermission('View User');
    const canDisable = hasPermission('Manage User');

    const handleAction = (user: User, action: string) => {
        setSelectedUser(user);
        setActionType(action);

        if (action === 'edit-role') {
            setShowEditRole(true);
        } else if (action === 'view') {
            setShowUserDetails(true);
        } else {
            setShowConfirmation(true);
        }
    };

    const confirmAction = () => {
        if (!selectedUser) return;

        switch (actionType) {
            case 'disable':
                router.put(tenantRoute('users.disable', { userId: selectedUser.id }));
                break;
            case 'enable':
                router.put(tenantRoute('users.enable', { userId: selectedUser.id }));
                break;
            case 'delete':
                router.delete(tenantRoute('users.destroy', { userId: selectedUser.id }));
                break;
            case 'resend-invite':
                if (selectedUser.id) {
                    router.post(tenantRoute('invites.resend', { inviteId: selectedUser.id }));
                }
                break;
            case 'cancel-invite':
                if (selectedUser.id) {
                    router.delete(tenantRoute('invites.cancel', { inviteId: selectedUser.id }));
                }
                break;
        }

        setShowConfirmation(false);
        setSelectedUser(null);
    };

    const getStatusBadge = (status: string) => {
        if (!status) return null;

        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            inactive: 'destructive',
            invited: 'secondary',
        };

        // Capitalize first letter and convert to title case
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

        return <Badge variant={variants[status] || 'secondary'}>{formattedStatus}</Badge>;
    };

    const getActionMenu = (user: User) => {
        const actions = [];

        if (canEditRole) {
            actions.push(
                <DropdownMenuItem key="edit-role" onClick={() => handleAction(user, 'edit-role')} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Role
                </DropdownMenuItem>,
            );
        }

        if (canView) {
            actions.push(
                <DropdownMenuItem key="view" onClick={() => handleAction(user, 'view')} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Details
                </DropdownMenuItem>,
            );
        }

        if (canDisable) {
            if (!user.is_disabled) {
                actions.push(
                    <DropdownMenuItem
                        key="disable"
                        onClick={() => handleAction(user, 'disable')}
                        className="flex items-center gap-2"
                        disabled={user.is_admin}
                        title={user.is_admin ? 'Cannot disable admin users' : ''}
                    >
                        <UserX className="h-4 w-4" />
                        Disable User
                    </DropdownMenuItem>,
                );
            } else {
                actions.push(
                    <DropdownMenuItem key="enable" onClick={() => handleAction(user, 'enable')} className="flex items-center gap-2">
                        <UserX className="h-4 w-4" />
                        Enable User
                    </DropdownMenuItem>,
                );
            }
        }

        if (canDelete) {
            actions.push(
                <DropdownMenuItem
                    key="delete"
                    onClick={() => handleAction(user, 'delete')}
                    className="flex items-center gap-2 text-destructive"
                    disabled={user.is_admin}
                    title={user.is_admin ? 'Cannot delete admin users' : ''}
                >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                </DropdownMenuItem>,
            );
        }

        return actions;
    };

    if (users.length === 0) {
        return (
            <div className="space-y-4">
                <NoData title="No users found" description={`No ${status} users to display at the moment.`} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">{user.name || 'No Name'}</div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    {user.role?.name && (
                                        <Badge key={user.role.id} variant="outline" className="mr-1">
                                            {user.role.name}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>{getStatusBadge(user.is_disabled ? 'inactive' : 'active')}</TableCell>
                                <TableCell>{user.created_at ? formatDate(user.created_at) : 'N/A'}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">{getActionMenu(user)}</DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {showConfirmation && (
                <ConfirmationDialog
                    open={showConfirmation}
                    onOpenChange={setShowConfirmation}
                    title={`Confirm ${actionType}`}
                    message={`Are you sure you want to ${actionType.replace('-', ' ')} ${selectedUser?.name || selectedUser?.email}?`}
                    onConfirm={confirmAction}
                />
            )}

            {showEditRole && selectedUser && (
                <EditRoleDialog
                    open={showEditRole}
                    onOpenChange={setShowEditRole}
                    user={selectedUser}
                    roles={roles}
                    onSuccess={() => {
                        setShowEditRole(false);
                        setSelectedUser(null);
                    }}
                />
            )}

            {showUserDetails && selectedUser && <UserDetailsDialog open={showUserDetails} onOpenChange={setShowUserDetails} user={selectedUser} />}
        </div>
    );
}
