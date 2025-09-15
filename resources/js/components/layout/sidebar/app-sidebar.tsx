import { NavMain } from '@/components/layout/navigation/nav-main';
import { NavUser } from '@/components/layout/navigation/nav-user';
import { BusinessDropdown } from '@/components/layout/business-dropdown';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAuthorization } from '@/hooks/useAuthorization';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Activity, LayoutGrid, Settings, Shield, Users } from 'lucide-react';
import AppLogo from '../app-logo';
import { useTenantRoute } from '@/utils/tenantRoute';

export function AppSidebar() {
    const { hasPermission } = useAuthorization();
    const tenantRoute = useTenantRoute()

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            name: 'dashboard',
            icon: LayoutGrid,
        },
        // Only show Roles if user has permission to view roles
        ...(hasPermission('View Role')
            ? [
                  {
                      title: 'Roles',
                      name: 'roles.index',
                      icon: Shield,
                  },
              ]
            : []),
        // Only show Users if user has permission to view users
        ...(hasPermission('View User')
            ? [
                  {
                      title: 'Users',
                      name: 'users.index',
                      icon: Users,
                  },
              ]
            : []),
        // Only show Activity Logs if user has permission to view activity logs
        ...(hasPermission('View Activity Log')
            ? [
                  {
                      title: 'Activity Logs',
                      name: 'activity-logs.index',
                      icon: Activity,
                  },
              ]
            : []),
        // Settings - always visible for authenticated users
        {
            title: 'Settings',
            name: 'settings.general',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={tenantRoute('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <BusinessDropdown />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
