import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Role } from '@/types';
import { formatDate } from '@/utils/date';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role | null;
}

export function RoleViewDialog({ open, onOpenChange, role }: Props) {
    if (!role) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Role Details</DialogTitle>
                    <DialogDescription>View role information and permissions</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">{role.name}</h3>
                        {role.description && <p className="mt-1 text-muted-foreground">{role.description}</p>}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {role.permissions && role.permissions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.map((permission) => (
                                        <Badge key={permission.id} variant="secondary">
                                            {permission.name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No permissions assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Created:</span>
                            <span className="ml-2 text-muted-foreground">{formatDate(role.created_at)}</span>
                        </div>
                        <div>
                            <span className="font-medium">Last Updated:</span>
                            <span className="ml-2 text-muted-foreground">{role.updated_at ? formatDate(role.updated_at) : 'Never'}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
