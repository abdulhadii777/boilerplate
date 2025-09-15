import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { MainPageProps, BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Shield, Key, Lock, Eye, EyeOff } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Security settings',
        name: 'settings.security',
    },
];

export default function SecuritySettings() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Security Settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
                        <p className="text-muted-foreground">Manage your security preferences and authentication settings.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Authentication
                            </CardTitle>
                            <CardDescription>Configure authentication and login security settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                                    </div>
                                    <Switch id="two-factor" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="remember-device">Remember Device</Label>
                                        <p className="text-sm text-muted-foreground">Skip two-factor authentication on trusted devices</p>
                                    </div>
                                    <Switch id="remember-device" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="login-notifications">Login Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                                    </div>
                                    <Switch id="login-notifications" defaultChecked />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Password Policy
                            </CardTitle>
                            <CardDescription>Configure password requirements and policies.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="min-length">Minimum Password Length</Label>
                                    <Input id="min-length" type="number" placeholder="8" defaultValue="8" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="require-uppercase">Require Uppercase Letters</Label>
                                        <p className="text-sm text-muted-foreground">Passwords must contain uppercase letters</p>
                                    </div>
                                    <Switch id="require-uppercase" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="require-numbers">Require Numbers</Label>
                                        <p className="text-sm text-muted-foreground">Passwords must contain numbers</p>
                                    </div>
                                    <Switch id="require-numbers" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="require-symbols">Require Special Characters</Label>
                                        <p className="text-sm text-muted-foreground">Passwords must contain special characters</p>
                                    </div>
                                    <Switch id="require-symbols" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Session Management
                            </CardTitle>
                            <CardDescription>Configure session timeout and security settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                                    <Input id="session-timeout" type="number" placeholder="120" defaultValue="120" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="force-logout">Force Logout on Password Change</Label>
                                        <p className="text-sm text-muted-foreground">Log out all devices when password is changed</p>
                                    </div>
                                    <Switch id="force-logout" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="concurrent-sessions">Limit Concurrent Sessions</Label>
                                        <p className="text-sm text-muted-foreground">Limit the number of active sessions per user</p>
                                    </div>
                                    <Switch id="concurrent-sessions" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline">Reset to Defaults</Button>
                        <Button>Save Changes</Button>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
