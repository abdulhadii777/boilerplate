import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Copy, Eye, EyeOff, Key, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'API Keys settings',
        name: 'settings.api-keys',
    },
];

// Mock API keys data
const apiKeys = [
    {
        id: 1,
        name: 'Production API Key',
        key: 'sk-prod-1234567890abcdef',
        permissions: ['read', 'write'],
        lastUsed: '2 hours ago',
        status: 'active',
        createdAt: '2024-01-01'
    },
    {
        id: 2,
        name: 'Development API Key',
        key: 'sk-dev-abcdef1234567890',
        permissions: ['read'],
        lastUsed: '1 day ago',
        status: 'active',
        createdAt: '2024-01-15'
    },
    {
        id: 3,
        name: 'Webhook Key',
        key: 'sk-webhook-9876543210fedcba',
        permissions: ['webhook'],
        lastUsed: 'Never',
        status: 'inactive',
        createdAt: '2024-01-10'
    },
];

export default function ApiKeysSettings() {
    const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});

    const toggleKeyVisibility = (id: number) => {
        setShowKeys(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="API Keys Settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
                        <p className="text-muted-foreground">Manage your API keys for accessing the application programmatically.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Your API Keys
                            </CardTitle>
                            <CardDescription>Create and manage API keys for different environments and purposes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">
                                        {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''} configured
                                    </p>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create New Key
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {apiKeys.map((apiKey) => (
                                        <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-medium">{apiKey.name}</h3>
                                                    <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                                                        {apiKey.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <code className="text-sm bg-muted px-2 py-1 rounded">
                                                        {showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••'}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleKeyVisibility(apiKey.id)}
                                                    >
                                                        {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(apiKey.key)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>Created: {apiKey.createdAt}</span>
                                                    <span>Last used: {apiKey.lastUsed}</span>
                                                    <div className="flex gap-1">
                                                        {apiKey.permissions.map((permission) => (
                                                            <Badge key={permission} variant="outline" className="text-xs">
                                                                {permission}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Create New API Key</CardTitle>
                            <CardDescription>Generate a new API key with specific permissions and access controls.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="key-name">Key Name</Label>
                                    <Input id="key-name" placeholder="Enter a descriptive name for this key" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="permissions">Permissions</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select permissions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="read">Read Only</SelectItem>
                                            <SelectItem value="write">Read & Write</SelectItem>
                                            <SelectItem value="admin">Full Access</SelectItem>
                                            <SelectItem value="webhook">Webhook Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expiration">Expiration (Optional)</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select expiration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="never">Never</SelectItem>
                                            <SelectItem value="30">30 days</SelectItem>
                                            <SelectItem value="90">90 days</SelectItem>
                                            <SelectItem value="365">1 year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Add a description for this API key"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline">Cancel</Button>
                                <Button>Create API Key</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>API Documentation</CardTitle>
                            <CardDescription>Learn how to use your API keys with our comprehensive documentation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Visit our API documentation to learn about available endpoints, authentication methods, and best practices.
                                </p>
                                <Button variant="outline" size="sm">
                                    View API Documentation
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
