import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagInput } from '@/components/ui/tag-input';
import { type SimpleRole } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useTenantRoute } from '@/utils/tenantRoute';
interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: SimpleRole[];
}

export function InviteDialog({ open, onOpenChange, roles }: Props) {
    const [emails, setEmails] = useState<string[]>([]);
    const [roleId, setRoleId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const tenantRoute = useTenantRoute()
    const validateEmails = (emailList: string[]): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailList.every((email) => emailRegex.test(email));
    };

    const handleClose = () => {
        setEmails([]);
        setRoleId('');
        setErrors({});
        onOpenChange(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emails.length || !roleId) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            await router.post(tenantRoute('users.invite'), {
                emails: emails.join(', '),
                role_id: parseInt(roleId),
            });

            // Close dialog on success
            handleClose();
        } catch (error: unknown) {
            // Handle validation errors
            if (error && typeof error === 'object' && 'response' in error) {
                const responseError = error as { response?: { data?: { errors?: Record<string, string> } } };
                if (responseError.response?.data?.errors) {
                    setErrors(responseError.response.data.errors);
                } else {
                    setErrors({ emails: 'An unexpected error occurred. Please try again.' });
                }
            } else {
                setErrors({ emails: 'An unexpected error occurred. Please try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasValidEmails = emails.length > 0 && validateEmails(emails);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Users</DialogTitle>
                    <DialogDescription>Invite multiple users by entering their email addresses. Press Enter after each email.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="emails">Email Addresses</Label>
                        <TagInput value={emails} onChange={setEmails} placeholder="Enter email address and press Enter" error={errors.emails} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={roleId} onValueChange={setRoleId}>
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
                        {errors.role_id && <InputError message={errors.role_id} />}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!hasValidEmails || !roleId || isSubmitting}>
                            {isSubmitting ? 'Sending Invites...' : 'Send Invites'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
