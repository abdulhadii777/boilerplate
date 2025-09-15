import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Role } from '@/types';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { PermissionSelector } from './permission-selector';
import { useTenantRoute } from '@/utils/tenantRoute';
interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: Role | null;
    permissions: Array<{
        id: number;
        name: string;
        guard_name: string;
    }>;
    mode: 'create' | 'edit';
}

export function RoleDialog({ open, onOpenChange, role, permissions, mode }: Props) {
    const tenantRoute = useTenantRoute()
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        permissions: [] as string[],
    });

    useEffect(() => {
        if (role) {
            setData({
                name: role.name,
                description: role.description || '',
                permissions: role.permissions?.map((p) => p.id.toString()) || [],
            });
        }
    }, [role, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            post(tenantRoute('roles.store'), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            put(tenantRoute('roles.update', { role: role?.id }), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    const handlePermissionChange = (permissions: string[]) => {
        setData('permissions', permissions);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create New Role' : 'Edit Role'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Create a new role with specific permissions.' : 'Update the role details and permissions.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter role name"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Enter role description (optional)"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label>Permissions</Label>
                            <PermissionSelector
                                permissions={permissions}
                                selectedPermissions={data.permissions}
                                onPermissionsChange={handlePermissionChange}
                                error={errors.permissions}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Update Role'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
