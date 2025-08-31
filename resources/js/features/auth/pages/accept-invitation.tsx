import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { UserPlus, Building2 } from 'lucide-react';
import { AcceptInvitationPageProps } from '@/features/users/types';
import { Form } from '@inertiajs/react';

export default function AcceptInvitationPage({ invitation }: AcceptInvitationPageProps) {
    return (
        <>
            <Head title="Accept Invitation" />
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <UserPlus className="mx-auto h-12 w-12 text-primary" />
                        <h2 className="mt-6 text-3xl font-bold tracking-tight">
                            Accept Invitation
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            You've been invited to join {invitation.tenant.name}
                        </p>
                    </div>

                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center space-x-2">
                                <Building2 className="h-5 w-5" />
                                <span>{invitation.tenant.name}</span>
                            </CardTitle>
                            <div className="flex items-center justify-center space-x-2">
                                <Badge variant="secondary">{invitation.role}</Badge>
                                <span className="text-sm text-muted-foreground">Role</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Form
                                method="post"
                                action={`/invitation/${invitation.token}`}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="Enter your full name"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="Create a password"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        required
                                        placeholder="Confirm your password"
                                        className="mt-1"
                                    />
                                </div>

                                <Button type="submit" className="w-full">
                                    Accept Invitation & Create Account
                                </Button>
                            </Form>

                            <div className="mt-4 text-center text-sm text-muted-foreground">
                                <p>This invitation will expire on {new Date(invitation.expires_at).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
