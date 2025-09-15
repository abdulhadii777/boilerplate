import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { MainPageProps, BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'General settings',
        name: 'settings.general',
    },
];

export default function GeneralSettings() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">General Settings</h2>
                        <p className="text-muted-foreground">Manage your general application settings and preferences.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Application Information</CardTitle>
                            <CardDescription>Configure basic application settings and information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="app-name">Application Name</Label>
                                    <Input id="app-name" placeholder="Enter application name" defaultValue="Laravel Starter Kit" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="app-description">Description</Label>
                                    <Textarea 
                                        id="app-description" 
                                        placeholder="Enter application description"
                                        defaultValue="A modern Laravel application with multi-tenancy support"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="app-url">Application URL</Label>
                                    <Input id="app-url" placeholder="https://example.com" defaultValue="https://testing.test" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Localization</CardTitle>
                            <CardDescription>Configure language and regional settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Input id="timezone" placeholder="Select timezone" defaultValue="UTC" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <Input id="language" placeholder="Select language" defaultValue="English" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date-format">Date Format</Label>
                                    <Input id="date-format" placeholder="Select date format" defaultValue="MM/DD/YYYY" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
