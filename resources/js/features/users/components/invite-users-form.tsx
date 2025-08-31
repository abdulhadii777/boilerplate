import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Plus, X, UserPlus } from 'lucide-react';
import { InvitationFormData, TenantRole, TenantPermissions } from '@/features/users/types';
import { router } from '@inertiajs/react';

interface InviteUsersFormProps {
    tenant: {
        id: string;
        name: string;
    };
    availableRoles: TenantRole[];
    permissions: TenantPermissions;
}

export default function InviteUsersForm({ tenant, availableRoles, permissions }: InviteUsersFormProps) {
    const [invitations, setInvitations] = useState<InvitationFormData[]>([
        { email: '', role: availableRoles.length > 0 ? availableRoles[0].name : '' }
    ]);
    const [processing, setProcessing] = useState(false);

    if (!permissions.can_manage_users) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p>You don't have permission to invite users.</p>
                </CardContent>
            </Card>
        );
    }

    const addInvitation = () => {
        if (invitations.length < 10) {
            setInvitations([...invitations, { 
                email: '', 
                role: availableRoles.length > 0 ? availableRoles[0].name : '' 
            }]);
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
        const validInvitations = invitations.filter(inv => inv.email.trim() && inv.role);
        if (validInvitations.length === 0) return;

        setProcessing(true);
        
        try {
            await router.post(`/t/${tenant.id}/users`, { invitations: validInvitations });
            // Redirect to users index page
            router.visit(`/t/${tenant.id}/users`);
        } catch {
            // Handle error silently
        } finally {
            setProcessing(false);
        }
    };

    const isValid = invitations.some(inv => inv.email.trim() && inv.role);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invite New Users</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {invitations.map((invitation, index) => (
                            <Card key={index} className="border-dashed">
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor={`email-${index}`}>Email Address</Label>
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
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableRoles.map((role) => (
                                                        <SelectItem key={role.name} value={role.name}>
                                                            {role.display_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {invitations.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeInvitation(index)}
                                                className="mt-6"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {invitations.length < 10 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addInvitation}
                            className="w-full"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Another User
                        </Button>
                    )}

                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(`/t/${tenant.id}/users`)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || processing}
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {processing ? 'Sending Invitations...' : `Send ${invitations.filter(inv => inv.email.trim() && inv.role).length} Invitation(s)`}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
