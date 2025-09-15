import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CreditCard, Download, Plus, Receipt } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing settings',
        name: 'settings.billing',
    },
];

// Mock billing data
const invoices = [
    {
        id: 'INV-001',
        date: '2024-01-15',
        amount: '$99.00',
        status: 'paid',
        description: 'Pro Plan - Monthly'
    },
    {
        id: 'INV-002',
        date: '2023-12-15',
        amount: '$99.00',
        status: 'paid',
        description: 'Pro Plan - Monthly'
    },
    {
        id: 'INV-003',
        date: '2023-11-15',
        amount: '$99.00',
        status: 'paid',
        description: 'Pro Plan - Monthly'
    },
];

export default function BillingSettings() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Billing & Subscription</h2>
                        <p className="text-muted-foreground">Manage your subscription, billing information, and payment methods.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Current Plan
                            </CardTitle>
                            <CardDescription>Your current subscription plan and billing details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Pro Plan</h3>
                                        <p className="text-sm text-muted-foreground">$99.00/month</p>
                                    </div>
                                    <Badge variant="default">Active</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Next billing date</p>
                                        <p className="font-medium">February 15, 2024</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Payment method</p>
                                        <p className="font-medium">•••• •••• •••• 4242</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">Change Plan</Button>
                                    <Button variant="outline" size="sm">Update Payment</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Information</CardTitle>
                            <CardDescription>Update your billing address and tax information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company-name">Company Name</Label>
                                    <Input id="company-name" placeholder="Enter company name" defaultValue="Acme Inc." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="billing-email">Billing Email</Label>
                                    <Input id="billing-email" type="email" placeholder="billing@example.com" defaultValue="billing@acme.com" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Select defaultValue="us">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="us">United States</SelectItem>
                                                <SelectItem value="ca">Canada</SelectItem>
                                                <SelectItem value="uk">United Kingdom</SelectItem>
                                                <SelectItem value="au">Australia</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tax-id">Tax ID</Label>
                                        <Input id="tax-id" placeholder="Enter tax ID" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Billing Address</Label>
                                    <Input id="address" placeholder="Enter billing address" defaultValue="123 Main St, City, State 12345" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Invoice History
                            </CardTitle>
                            <CardDescription>View and download your past invoices.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {invoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <p className="font-medium">{invoice.id}</p>
                                                <p className="text-sm text-muted-foreground">{invoice.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <p className="font-medium">{invoice.amount}</p>
                                                <p className="text-sm text-muted-foreground">{invoice.date}</p>
                                            </div>
                                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                                {invoice.status}
                                            </Badge>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
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
