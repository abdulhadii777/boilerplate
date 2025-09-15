import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ExternalLink, Github, Mail, Slack, Zap } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Integrations settings',
        name: 'settings.integrations',
    },
];

// Mock integrations data
const integrations = [
    {
        id: 1,
        name: 'GitHub',
        description: 'Connect your GitHub repositories for seamless development workflow',
        icon: Github,
        status: 'connected',
        lastSync: '2 hours ago'
    },
    {
        id: 2,
        name: 'Slack',
        description: 'Get notifications and updates directly in your Slack workspace',
        icon: Slack,
        status: 'connected',
        lastSync: '1 day ago'
    },
    {
        id: 3,
        name: 'Email Service',
        description: 'Configure SMTP settings for sending transactional emails',
        icon: Mail,
        status: 'not_connected',
        lastSync: null
    },
    {
        id: 4,
        name: 'Webhooks',
        description: 'Set up webhooks to receive real-time updates from external services',
        icon: Zap,
        status: 'not_connected',
        lastSync: null
    },
];

export default function IntegrationsSettings() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Integrations Settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
                        <p className="text-muted-foreground">Connect external services and tools to enhance your workflow.</p>
                    </div>

                    <div className="grid gap-4">
                        {integrations.map((integration) => (
                            <Card key={integration.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <integration.icon className="h-8 w-8" />
                                            <div>
                                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                                <CardDescription>{integration.description}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge 
                                                variant={integration.status === 'connected' ? 'default' : 'secondary'}
                                            >
                                                {integration.status === 'connected' ? 'Connected' : 'Not Connected'}
                                            </Badge>
                                            {integration.status === 'connected' && (
                                                <Button variant="ghost" size="sm">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                {integration.status === 'connected' && (
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Switch defaultChecked />
                                                    <span className="text-sm">Enabled</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Last sync: {integration.lastSync}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm">Configure</Button>
                                                <Button variant="outline" size="sm">Disconnect</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                                {integration.status === 'not_connected' && (
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                This integration is not yet configured
                                            </p>
                                            <Button size="sm">Connect</Button>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>API Configuration</CardTitle>
                            <CardDescription>Configure API settings for external integrations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium">Enable API Access</p>
                                        <p className="text-xs text-muted-foreground">Allow external services to access your API</p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium">Rate Limiting</p>
                                        <p className="text-xs text-muted-foreground">Limit API requests per minute</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium">Webhook Validation</p>
                                        <p className="text-xs text-muted-foreground">Validate webhook signatures for security</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
