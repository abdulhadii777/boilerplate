import { Head } from '@inertiajs/react';
import TenantLayout from '@/shared/components/tenant-layout';
import InviteUsersForm from '@/features/users/components/invite-users-form';
import { UsersCreatePageProps } from '@/features/users/types';

export default function UsersCreatePage({ tenant, availableRoles, permissions }: Omit<UsersCreatePageProps, 'user'>) {
    return (
        <>
            <Head title="Invite Users" />
            <TenantLayout>
                <div className="flex-1 space-y-6 p-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Invite Users</h1>
                        <p className="text-muted-foreground">
                            Invite new users to join this organization.
                        </p>
                    </div>

                    {/* Invite Users Form */}
                    <InviteUsersForm tenant={tenant} availableRoles={availableRoles} permissions={permissions} />
                </div>
            </TenantLayout>
        </>
    );
}
