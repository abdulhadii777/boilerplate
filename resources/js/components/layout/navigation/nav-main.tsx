import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { useTenantRoute } from '@/utils/tenantRoute';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage(); 
    const tenantRoute = useTenantRoute()
    
    const isActive = (itemName: string) => {
        const itemUrl = tenantRoute(itemName);
        const currentUrl = page.url;
        
        // Extract path from both URLs for comparison
        const getPathFromUrl = (url: string) => {
            try {
                const urlObj = new URL(url, window.location.origin);
                return urlObj.pathname;
            } catch {
                // If it's already a relative URL, return as is
                return url.split('?')[0].split('#')[0];
            }
        };
        
        const currentPath = getPathFromUrl(currentUrl);
        const itemPath = getPathFromUrl(itemUrl);
        
        // Special handling for settings pages
        if (itemName === 'settings.general') {
            return currentPath.includes('/settings');
        }
        
        // For exact matches or when current path starts with the item path
        return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
    };
    
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.name)} tooltip={{ children: item.title }}>
                            <Link href={tenantRoute(item.name)} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
