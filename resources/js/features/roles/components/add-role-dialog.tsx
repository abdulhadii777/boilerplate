import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { LoaderCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { useRoleForm } from '@/features/roles/hooks/use-role-form';
import { NewRole, Permission } from '@/features/roles/types';

interface AddRoleDialogProps {
    permissions: Permission[];
    onRoleCreated?: (role: NewRole) => void;
    onError?: (message: string) => void;
}

export default function AddRoleDialog({ permissions, onRoleCreated, onError }: AddRoleDialogProps) {
    const [open, setOpen] = useState(false);
    const { formData, loading, updateFormField, handlePermissionChange, resetForm, isFormValid, setLoadingState } = useRoleForm();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingState(true);

        try {
            // Get current tenant from URL
            const pathParts = window.location.pathname.split('/');
            const tenantIndex = pathParts.findIndex(part => part === 't');
            const tenantId = tenantIndex !== -1 ? pathParts[tenantIndex + 1] : null;

            if (!tenantId) {
                throw new Error('Tenant ID not found');
            }

            // Make API call to create role
            const response = await fetch(`/t/${tenantId}/roles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create role');
            }

            const result = await response.json();

            // Reset form and close dialog
            resetForm();
            setOpen(false);

            if (onRoleCreated) {
                onRoleCreated(result.role);
            }
        } catch (error) {
            console.error('Error creating role:', error);
            if (onError) {
                onError(error instanceof Error ? error.message : 'Failed to create role. Please try again.');
            }
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Role
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogDescription>Create a new role with specific permissions for your organization.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Role Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => updateFormField('name', e.target.value)}
                                placeholder="e.g., moderator, editor"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Use lowercase letters and underscores only (e.g., content_moderator)</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="display_name">Display Name *</Label>
                            <Input
                                id="display_name"
                                value={formData.display_name}
                                onChange={(e) => updateFormField('display_name', e.target.value)}
                                placeholder="e.g., Content Moderator"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormField('description', e.target.value)}
                                placeholder="Describe what this role can do..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Permissions</Label>
                        <div className="grid max-h-60 gap-3 overflow-y-auto rounded-lg border p-4">
                            {permissions.map((permission) => (
                                <div key={permission.name} className="flex items-start space-x-3">
                                    <Checkbox
                                        id={permission.name}
                                        checked={formData.permissions.includes(permission.name)}
                                        onCheckedChange={(checked) => handlePermissionChange(permission.name, checked as boolean)}
                                    />
                                    <div className="grid gap-1">
                                        <Label
                                            htmlFor={permission.name}
                                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {permission.display_name}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                            Reset
                        </Button>
                        <Button type="submit" disabled={loading || !isFormValid()}>
                            {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Role
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
