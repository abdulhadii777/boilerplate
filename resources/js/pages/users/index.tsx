import { Button } from '@/components/ui/button';
import Heading from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InviteDialog } from '@/components/users/invite-dialog';
import { InviteTable } from '@/components/users/invite-table';
import { UserTable } from '@/components/users/user-table';
import { useAuthorization } from '@/hooks/useAuthorization';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Invite, type PageProps, type SimpleRole, type User } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Props extends Omit<PageProps, 'roles'> {
    users: User[];
    invites: Invite[];
    roles: SimpleRole[];
    activeUsersCount: number;
    inactiveUsersCount: number;
    totalInvites: number;
}

export default function UsersIndex({ users, invites, roles, activeUsersCount, inactiveUsersCount, totalInvites }: Props) {
    const { hasPermission } = useAuthorization();

    const getTabFromUrl = useCallback(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        // Only return valid tab values, default to 'active'
        return ['active', 'inactive', 'invited'].includes(tab || '') ? tab : 'active';
    }, []);

    const [selectedTab, setSelectedTab] = useState<string>(getTabFromUrl() || 'active');
    const [showInviteDialog, setShowInviteDialog] = useState(false);

    // Single, clean useEffect to sync tab with URL
    useEffect(() => {
        const currentTab = getTabFromUrl();
        if (currentTab && currentTab !== selectedTab) {
            setSelectedTab(currentTab);
        }
    }, [getTabFromUrl, selectedTab]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            name: 'users.index',
        },
    ];

    const handleTabChange = (value: string) => {
        if (value === selectedTab) {
            return;
        }

        // Update local state immediately
        setSelectedTab(value);

        // Update URL manually without router interference
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tab', value);
        window.history.replaceState({}, '', currentUrl.toString());
    };

    const canInvite = hasPermission('Invite User');
    // Filter users based on selected tab
    const filteredUsers = users.filter((user) => {
        // If status is not available, check deleted_at directly
        const userStatus = user.is_disabled ? 'inactive' : 'active';

        if (selectedTab === 'active') return userStatus === 'active';
        if (selectedTab === 'inactive') return userStatus === 'inactive';
        return false;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex-1 space-y-4 p-4 pt-6">
                <div className="flex items-center justify-between">
                    <Heading title="Users" />
                    {canInvite && (
                        <Button onClick={() => setShowInviteDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Invite Users
                        </Button>
                    )}
                </div>

                <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="active">Active ({activeUsersCount})</TabsTrigger>
                        <TabsTrigger value="inactive">Inactive ({inactiveUsersCount})</TabsTrigger>
                        <TabsTrigger value="invited">Invited ({totalInvites})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        <UserTable users={filteredUsers} roles={roles} status="active" />
                    </TabsContent>

                    <TabsContent value="inactive" className="space-y-4">
                        <UserTable users={filteredUsers} roles={roles} status="inactive" />
                    </TabsContent>

                    <TabsContent value="invited" className="space-y-4">
                        <InviteTable invites={invites} totalCount={totalInvites} />
                    </TabsContent>
                </Tabs>
            </div>

            {showInviteDialog && <InviteDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} roles={roles} />}
        </AppLayout>
    );
}
