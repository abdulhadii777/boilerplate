import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { MoreHorizontal, User, Mail, Clock, Trash2, CheckCircle, XCircle, Crown, Shield, Users } from 'lucide-react';
import { UserCard } from '@/features/users/types';
import { router } from '@inertiajs/react';
import { usePermissions } from '@/shared/hooks/usePermissions';

interface UnifiedUsersGridProps {
    userCards: UserCard[];
}

export default function UnifiedUsersGrid({ userCards }: UnifiedUsersGridProps) {
    const { can } = usePermissions();

    const handleRemoveUser = (userCard: UserCard) => {
        if (userCard.type === 'user' && userCard.user_id) {
            if (confirm(`Are you sure you want to remove ${userCard.name} from this tenant?`)) {
                router.delete(`/t/${userCard.tenant_id}/users/${userCard.user_id}`);
            }
        }
    };

    const handleCancelInvitation = (userCard: UserCard) => {
        if (userCard.type === 'invitation' && userCard.invitation_id) {
            if (confirm(`Are you sure you want to cancel the invitation to ${userCard.email}?`)) {
                router.delete(`/t/${userCard.tenant_id}/users/invitations/${userCard.invitation_id}`);
            }
        }
    };

    const getStatusBadge = (userCard: UserCard) => {
        if (userCard.type === 'user') {
            const role = userCard.role.toLowerCase();
            if (role === 'owner') {
                return <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white">Owner</Badge>;
            } else if (role === 'admin') {
                return <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-indigo-500 border-0 text-white">Admin</Badge>;
            } else {
                return <Badge variant="secondary" className="bg-muted/50 border-border/30 text-foreground/80">Member</Badge>;
            }
        }

        if (userCard.type === 'invitation') {
            switch (userCard.status) {
                case 'pending':
                    return <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-cyan-500 border-0 text-white">Pending</Badge>;
                case 'accepted':
                    return <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 text-white">Accepted</Badge>;
                case 'expired':
                    return <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-pink-500 border-0 text-white">Expired</Badge>;
                default:
                    return <Badge variant="outline" className="border-border/30 text-foreground/70">{userCard.role}</Badge>;
            }
        }

        return null;
    };

    const getAvatar = (userCard: UserCard) => {
        if (userCard.type === 'user' && userCard.name) {
            const role = userCard.role.toLowerCase();
            let bgColor = 'bg-muted';
            let icon = <User className="h-5 w-5" />;
            
            if (role === 'owner') {
                bgColor = 'bg-gradient-to-br from-amber-500 to-orange-500';
                icon = <Crown className="h-5 w-5 text-white" />;
            } else if (role === 'admin') {
                bgColor = 'bg-gradient-to-br from-blue-500 to-indigo-500';
                icon = <Shield className="h-5 w-5 text-white" />;
            } else {
                bgColor = 'bg-gradient-to-br from-slate-500 to-gray-500';
                icon = <Users className="h-5 w-5 text-white" />;
            }

            return (
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${bgColor} shadow-lg`}>
                    {icon}
                </div>
            );
        }

        if (userCard.type === 'invitation') {
            return (
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-500" />
                </div>
            );
        }

        return null;
    };

    const getStatusIcon = (userCard: UserCard) => {
        if (userCard.type === 'invitation') {
            switch (userCard.status) {
                case 'pending':
                    return <Clock className="h-4 w-4 text-blue-400" />;
                case 'accepted':
                    return <CheckCircle className="h-4 w-4 text-green-400" />;
                case 'expired':
                    return <XCircle className="h-4 w-4 text-red-400" />;
                default:
                    return null;
            }
        }
        return null;
    };

    if (userCards.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                    <User className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground/70 mb-2">No users or invitations found</h3>
                <p className="text-muted-foreground">Get started by inviting your first team member.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {userCards.map((userCard) => (
                <Card key={userCard.id} className="group bg-card/50 backdrop-blur-sm border border-border/30 hover:bg-card/70 hover:border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            {getAvatar(userCard)}
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-foreground/90 truncate">
                                        {userCard.type === 'user' ? userCard.name : userCard.email}
                                    </h3>
                                    {getStatusIcon(userCard)}
                                </div>
                                
                                <p className="text-sm text-muted-foreground/80 truncate mb-3">
                                    {userCard.email}
                                </p>
                                
                                {userCard.type === 'invitation' && userCard.expires_at && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/70 mb-3">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            {userCard.status === 'expired' 
                                                ? 'Expired' 
                                                : `Expires ${new Date(userCard.expires_at).toLocaleDateString()}`
                                            }
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                    {getStatusBadge(userCard)}
                                    
                                    {can('can_remove_users') && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted/50"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                {userCard.type === 'user' ? (
                                                    <DropdownMenuItem 
                                                        onClick={() => handleRemoveUser(userCard)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove User
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem 
                                                        onClick={() => handleCancelInvitation(userCard)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Cancel Invitation
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
