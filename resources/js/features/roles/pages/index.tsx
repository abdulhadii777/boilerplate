import { Head } from '@inertiajs/react';
import TenantLayout from '@/shared/components/tenant-layout';
import RoleDescriptions from '@/features/roles/components/role-descriptions';
import AddRoleDialog from '@/features/roles/components/add-role-dialog';
import { ToastContainer } from '@/shared/components/ui/toast';
import { useToast } from '@/shared/hooks';
import { useRoleManagement } from '../hooks/use-role-management';
import { RoleManagementPageProps } from '../types';

export default function RoleManagementPage({ 
    tenant, 
    user, 
    availableRoles, 
    availablePermissions, 
    permissions
}: RoleManagementPageProps) {
    // Ensure we have valid data
    const validAvailableRoles = availableRoles || [];
    const validAvailablePermissions = availablePermissions || [];
    const validPermissions = permissions || {};

    // Custom hooks
    const { toasts, addToast, removeToast } = useToast();
    const { handleRoleCreated, handleRoleError } = useRoleManagement();

    return (
        <>
            <Head title="Role Management" />
            <TenantLayout tenant={tenant} user={user} permissions={permissions}>
                <div className="flex-1 space-y-6 p-6">
                    {/* Header with Add Role Button */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
                            <p className="text-muted-foreground">
                                Manage roles and their permissions in your organization.
                            </p>
                        </div>
                        {validPermissions.can_manage_roles && (
                            <AddRoleDialog 
                                permissions={validAvailablePermissions}
                                onRoleCreated={(role) => handleRoleCreated(role, addToast)}
                                onError={(message) => handleRoleError(message, addToast)}
                            />
                        )}
                    </div>

                    {/* Roles Grid */}
                    <RoleDescriptions roles={validAvailableRoles} />
                </div>
                
                {/* Toast Container */}
                <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
            </TenantLayout>
        </>
    );
}
