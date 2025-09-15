import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type SimpleRole, type User } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useTenantRoute } from '@/utils/tenantRoute';
interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
    roles: SimpleRole[];
    onSuccess: () => void;
}

export function EditRoleDialog({ open, onOpenChange, user, roles, onSuccess }: Props) {
    const [selectedRoleId, setSelectedRoleId] = useState(user.roles?.[0]?.id ? user.roles[0].id.toString() : '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const tenantRoute = useTenantRoute()
    const handleSubmit = async () => {
        if (!selectedRoleId) return;

        setIsSubmitting(true);

        try {
            await router.put(tenantRoute('users.updateRole', { userId: user.id }), { role_id: parseInt(selectedRoleId) });
            onSuccess();
        } catch (error) {
            console.error('Error updating user role:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User Role</DialogTitle>
                    <DialogDescription>
                        Change the role for {user.name} ({user.email})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id.toString()}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!selectedRoleId || isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Role'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
