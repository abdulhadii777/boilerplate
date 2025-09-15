import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { MainPageProps, BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus, Search, Users, UserPlus, MoreHorizontal } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Team settings',
        name: 'settings.team',
    },
];

// Mock team members data
const teamMembers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'Active',
        lastActive: '2 hours ago',
        avatar: 'JD'
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Manager',
        status: 'Active',
        lastActive: '1 day ago',
        avatar: 'JS'
    },
    {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'User',
        status: 'Pending',
        lastActive: 'Never',
        avatar: 'BJ'
    },
];

export default function TeamSettings() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
                        <p className="text-muted-foreground">Manage your team members and their permissions.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Team Members
                            </CardTitle>
                            <CardDescription>View and manage all team members in your organization.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Search team members..." className="pl-8 w-64" />
                                        </div>
                                        <Select>
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Roles</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="manager">Manager</SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Invite Member
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-medium">{member.avatar}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{member.name}</p>
                                                        <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                                                            {member.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                    <p className="text-xs text-muted-foreground">Last active: {member.lastActive}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline">{member.role}</Badge>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Team Settings</CardTitle>
                            <CardDescription>Configure team-wide settings and permissions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="team-name">Team Name</Label>
                                    <Input id="team-name" placeholder="Enter team name" defaultValue="Development Team" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-members">Maximum Team Members</Label>
                                    <Input id="max-members" type="number" placeholder="50" defaultValue="50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="default-role">Default Role for New Members</Label>
                                    <Select defaultValue="user">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select default role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Save Changes</Button>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
