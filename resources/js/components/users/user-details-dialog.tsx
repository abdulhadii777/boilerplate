import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type User } from '@/types';
import { formatDate } from '@/utils/date';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export function UserDetailsDialog({ open, onOpenChange, user }: Props) {
    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Name</span>
                            <span className="text-sm">{user.name || 'No Name'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Email</span>
                            <span className="text-sm">{user.email}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                            <Badge variant={user.status === 'active' ? 'default' : user.status === 'inactive' ? 'destructive' : 'secondary'}>
                                {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase() : 'Unknown'}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Roles</span>
                            <div className="flex gap-1">
                                {user.roles && user.roles.length > 0 ? (
                                    user.roles.map((role) => (
                                        <Badge key={role.id} variant="outline" className="text-xs">
                                            {role.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No Role</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Created</span>
                            <span className="text-sm">{user.created_at ? formatDate(user.created_at) : 'N/A'}</span>
                        </div>

                        {user.email_verified_at && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Email Verified</span>
                                <span className="text-sm">{formatDate(user.email_verified_at)}</span>
                            </div>
                        )}

                        {user.updated_at && user.updated_at !== user.created_at && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                                <span className="text-sm">{formatDate(user.updated_at)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
