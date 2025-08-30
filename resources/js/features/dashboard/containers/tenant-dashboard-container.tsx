import StatsGrid from '@/features/dashboard/components/stats-grid';
import QuickActions from '@/features/dashboard/components/quick-actions';
import PermissionsCard from '@/features/dashboard/components/permissions-card';
import WelcomeSection from '@/features/dashboard/components/welcome-section';
import TenantLayout from '@/shared/components/tenant-layout';

interface TenantDashboardContainerProps {
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

export default function TenantDashboardContainer({ 
    tenant, 
    user, 
    stats, 
    permissions 
}: TenantDashboardContainerProps) {
    return (
        <TenantLayout tenant={tenant} user={user} permissions={permissions}>
            <div className="flex-1 space-y-6 p-6">
                <WelcomeSection user={user} />
                <StatsGrid stats={stats} />
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4">
                        <QuickActions tenant={tenant} permissions={permissions} />
                    </div>
                    <div className="col-span-3">
                        <PermissionsCard permissions={permissions} />
                    </div>
                </div>
            </div>
        </TenantLayout>
    );
}
