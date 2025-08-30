import { Head } from '@inertiajs/react';
import TenantDashboardContainer from '@/features/dashboard/containers/tenant-dashboard-container';

interface TenantDashboardPageProps {
    tenant: {
        id: string;
        name: string;
    };
    user: {
        name: string;
        email: string;
        role: string;
    };
    stats: {
        total_users: number;
        total_roles: number;
        total_permissions: number;
    };
    permissions: {
        can_manage_users: boolean;
        can_manage_roles: boolean;
        can_view_analytics: boolean;
        can_manage_settings: boolean;
    };
}

export default function TenantDashboardPage(props: TenantDashboardPageProps) {
    return (
        <>
            <Head title={`${props.tenant.name} Dashboard`} />
            <TenantDashboardContainer {...props} />
        </>
    );
}
