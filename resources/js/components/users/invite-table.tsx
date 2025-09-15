import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NoData } from '@/components/ui/no-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmationDialog } from '@/components/users/confirmation-dialog';
import { useAuthorization } from '@/hooks/useAuthorization';
import { type Invite } from '@/types';
import { formatDate } from '@/utils/date';
import { router } from '@inertiajs/react';
import { MoreHorizontal, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { useTenantRoute } from '@/utils/tenantRoute';
interface Props {
    invites: Invite[];
    totalCount: number;
}

export function InviteTable({ invites }: Props) {
    const { hasPermission } = useAuthorization();
    const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
    const [actionType, setActionType] = useState<string>('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const tenantRoute = useTenantRoute()
    const canCancelInvite = hasPermission('Invite User');
    const canResendInvite = hasPermission('Invite User');

    const handleAction = (invite: Invite, action: string) => {
        setSelectedInvite(invite);
        setActionType(action);
        setShowConfirmation(true);
    };

    const confirmAction = () => {
        if (!selectedInvite) return;

        switch (actionType) {
            case 'resend-invite':
                router.post(tenantRoute('invites.resend', { inviteId: selectedInvite.id }));
                break;
            case 'cancel-invite':
                router.delete(tenantRoute('invites.cancel', { inviteId: selectedInvite.id }));
                break;
        }

        setShowConfirmation(false);
        setSelectedInvite(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="default">Pending</Badge>;
            case 'accepted':
                return <Badge variant="secondary">Accepted</Badge>;
            case 'expired':
                return <Badge variant="destructive">Expired</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getActionMenu = (invite: Invite) => {
        const actions = [];

        // Show resend action if backend allows it
        if (canResendInvite && invite.can_resend) {
            actions.push(
                <DropdownMenuItem key="resend" onClick={() => handleAction(invite, 'resend-invite')} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Resend Invite
                </DropdownMenuItem>,
            );
        }

        // Show cancel action if backend allows it
        if (canCancelInvite && invite.can_cancel) {
            actions.push(
                <DropdownMenuItem key="cancel" onClick={() => handleAction(invite, 'cancel-invite')} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel Invite
                </DropdownMenuItem>,
            );
        }

        return actions;
    };

    const getConfirmationMessage = () => {
        if (!selectedInvite) return '';

        switch (actionType) {
            case 'resend-invite':
                return `Are you sure you want to resend the invitation to ${selectedInvite.email}?`;
            case 'cancel-invite':
                return `Are you sure you want to cancel the invitation to ${selectedInvite.email}?`;
            default:
                return '';
        }
    };

    const getConfirmationTitle = () => {
        switch (actionType) {
            case 'resend-invite':
                return 'Resend Invitation';
            case 'cancel-invite':
                return 'Cancel Invitation';
            default:
                return 'Confirm Action';
        }
    };

    if (invites.length === 0) {
        return (
            <div className="space-y-4">
                <NoData title="No invitations found" description="No pending or expired invitations to display at the moment." />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sent</TableHead>
                            <TableHead>Resent</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invites.map((invite) => (
                            <TableRow key={invite.id}>
                                <TableCell className="font-medium">{invite.email}</TableCell>
                                <TableCell>
                                    {invite.role ? (
                                        <Badge variant="outline">{invite.role.name}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground">No Role</span>
                                    )}
                                </TableCell>
                                <TableCell>{getStatusBadge(invite.status || '')}</TableCell>
                                <TableCell>{invite.created_at ? formatDate(invite.created_at) : 'N/A'}</TableCell>
                                <TableCell>{invite.resent_count > 0 ? invite.resent_count : '-'}</TableCell>
                                <TableCell>
                                    {getActionMenu(invite).length > 0 && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">{getActionMenu(invite)}</DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
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
                    title={getConfirmationTitle()}
                    message={getConfirmationMessage()}
                    onConfirm={confirmAction}
                    confirmText={actionType === 'cancel-invite' ? 'Cancel' : 'Confirm'}
                    variant={actionType === 'cancel-invite' ? 'destructive' : 'default'}
                />
            )}
        </div>
    );
}
