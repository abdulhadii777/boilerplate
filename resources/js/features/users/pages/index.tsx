import TenantLayout from '@/shared/components/tenant-layout';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import InviteUsersDialog from '@/features/users/components/invite-users-dialog';
import UnifiedUsersGrid from '@/features/users/components/unified-users-grid';
import { UserCard, TenantRole } from '@/features/users/types';

export default function UsersIndexPage({ userCards, availableRoles }: { userCards: UserCard[], availableRoles: TenantRole[] }) {
    return (
        <TenantLayout>
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-12"> {/* Modern Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                        User Management
                                    </h1>
                                </div>
                                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                                    Manage your organization's users and invitations with a modern, streamlined interface.
                                </p>
                            </div>
                            <PermissionGuard permission="can_invite_users">
                                <div className="flex-shrink-0">
                                    <InviteUsersDialog 
                                        availableRoles={availableRoles} 
                                        onSuccess={() => { window.location.reload(); }} 
                                    />
                                </div>
                            </PermissionGuard>
                        </div>
                    </div>
                    <div className="mb-8"> {/* Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Active Users Card */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6 hover:bg-card/70 hover:border-border/50 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {userCards.filter(card => card.type === 'user').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Invitations Card */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6 hover:bg-card/70 hover:border-border/50 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Pending Invitations</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {userCards.filter(card => card.type === 'invitation' && card.status === 'pending').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Available Roles Card */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6 hover:bg-card/70 hover:border-border/50 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Available Roles</p>
                                        <p className="text-2xl font-bold text-foreground">{availableRoles.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-3xl p-8"> {/* Content Section */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-foreground/90 mb-2">Organization Members</h2>
                            <p className="text-muted-foreground">Manage users and track invitation statuses</p>
                        </div>
                        <UnifiedUsersGrid userCards={userCards} />
                    </div>
                </div>
            </div>
        </TenantLayout>
    );
}
