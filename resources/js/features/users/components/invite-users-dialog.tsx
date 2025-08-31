import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { router } from '@inertiajs/react';
import { Plus, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { InvitationFormData, TenantRole } from '../types';

interface InviteUsersDialogProps {
    onSuccess: () => void;
    availableRoles: TenantRole[];
}

export default function InviteUsersDialog({ onSuccess, availableRoles }: InviteUsersDialogProps) {
    const [open, setOpen] = useState(false);
    const [invitations, setInvitations] = useState<InvitationFormData[]>([
        { email: '', role: availableRoles.length > 0 ? availableRoles[0].name : '' },
    ]);

    const [processing, setProcessing] = useState(false);

    // Get current tenant from the route
    const currentPath = window.location.pathname;
    const tenantMatch = currentPath.match(/\/t\/([^/]+)/);
    const currentTenant = tenantMatch ? tenantMatch[1] : '';

    const addInvitation = () => {
        if (invitations.length < 10) {
            setInvitations([
                ...invitations,
                {
                    email: '',
                    role: availableRoles.length > 0 ? availableRoles[0].name : '',
                },
            ]);
        }
    };

    const removeInvitation = (index: number) => {
        if (invitations.length > 1) {
            setInvitations(invitations.filter((_, i) => i !== index));
        }
    };

    const updateInvitation = (index: number, field: keyof InvitationFormData, value: string) => {
        const updated = [...invitations];
        updated[index] = { ...updated[index], [field]: value };
        setInvitations(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const validInvitations = invitations.filter((inv) => inv.email.trim() && inv.role);
        if (validInvitations.length === 0) {
            return;
        }

        setProcessing(true);

        try {
            await router.post(
                `/t/${currentTenant}/users`,
                {
                    invitations: validInvitations,
                },
                {
                    onSuccess: () => {
                        setOpen(false);
                        setInvitations([
                            {
                                email: '',
                                role: availableRoles.length > 0 ? availableRoles[0].name : '',
                            },
                        ]);
                        onSuccess();
                    },
                    onError: () => {
                        alert('There were errors with your invitation data. Please check the form and try again.');
                    },
                    onFinish: () => {
                        setProcessing(false);
                    },
                },
            );
        } catch {
            alert('Failed to send invitations. Please try again.');
            setProcessing(false);
        }
    };

    const isValid = invitations.some((inv) => inv.email.trim() && inv.role);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="border-0 bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-base font-medium shadow-lg transition-all duration-300 hover:from-primary/90 hover:to-primary/70 hover:shadow-xl">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Invite Users
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Invite Users</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        {invitations.map((invitation, index) => (
                            <Card key={index}>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor={`email-${index}`}>Email</Label>
                                            <Input
                                                id={`email-${index}`}
                                                type="email"
                                                placeholder="user@example.com"
                                                value={invitation.email}
                                                onChange={(e) => updateInvitation(index, 'email', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`role-${index}`}>Role</Label>
                                            <Select
                                                value={invitation.role}
                                                onValueChange={(value) => updateInvitation(index, 'role', value)}
                                                disabled={availableRoles.length === 0}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={availableRoles.length === 0 ? 'No roles available' : 'Select role'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableRoles.length === 0 ? (
                                                        <SelectItem value="no-roles" disabled>
                                                            {availableRoles === undefined ? 'Loading roles...' : 'No roles available'}
                                                        </SelectItem>
                                                    ) : (
                                                        availableRoles.map((role) => (
                                                            <SelectItem key={role.name} value={role.name}>
                                                                {role.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {invitations.length > 1 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeInvitation(index)} className="mt-6">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {invitations.length < 10 && (
                        <Button type="button" variant="outline" onClick={addInvitation} className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Another User
                        </Button>
                    )}

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isValid || processing}>
                            {processing ? 'Sending...' : `Send ${invitations.filter((inv) => inv.email.trim() && inv.role).length} Invitation(s)`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
