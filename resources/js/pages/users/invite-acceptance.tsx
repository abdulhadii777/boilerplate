import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { type Invite, type PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props extends PageProps {
    invite: Invite | { data: Invite };
    token: string;
    is_present: boolean;
    is_logged_in: boolean;
    current_user_email: string | null;
}

export default function InviteAcceptance({ invite, token, is_present, is_logged_in, current_user_email }: Props) {
    // Access the actual invite data (it might be wrapped in a data property)
    const inviteData = 'data' in invite ? invite.data : invite;
    
    const [formData, setFormData] = useState({
        name: '',
        email: inviteData.email || '',
        password: '',
        password_confirmation: '',
        role_id: inviteData.role?.id,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tenantId] = useState(window.location.pathname.split('/')[1])
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // For existing users, only validate token
        if (is_present) {
            setIsSubmitting(true);
            setErrors({});

            try {
                await router.post(`/${tenantId}/invites/accept`, {
                    tenant_id: tenantId,
                    token,
                    role_id: formData.role_id,
                });
            } catch (error: unknown) {
                if (error && typeof error === 'object' && 'response' in error) {
                    const responseError = error as { response?: { data?: { errors?: Record<string, string> } } };
                    if (responseError.response?.data?.errors) {
                        setErrors(responseError.response.data.errors);
                    } else {
                        setErrors({ general: 'An unexpected error occurred. Please try again.' });
                    }
                } else {
                    setErrors({ general: 'An unexpected error occurred. Please try again.' });
                }
                setIsSubmitting(false);
            }
            return;
        }

        // For new users, validate all fields
        if (!formData.name || !formData.password || !formData.password_confirmation) {
            setErrors({
                name: !formData.name ? 'Name is required' : '',
                password: !formData.password ? 'Password is required' : '',
                password_confirmation: !formData.password_confirmation ? 'Password confirmation is required' : '',
            });
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setErrors({ password_confirmation: 'Password confirmation does not match' });
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            await router.post(`/${tenantId}/invites/accept`, {
                tenant_id: tenantId,
                token,
                name: formData.name,
                role_id: formData.role_id,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            });
        } catch (error: unknown) {
            // Handle any unexpected errors
            if (error && typeof error === 'object' && 'response' in error) {
                const responseError = error as { response?: { data?: { errors?: Record<string, string> } } };
                if (responseError.response?.data?.errors) {
                    setErrors(responseError.response.data.errors);
                } else {
                    setErrors({ general: 'An unexpected error occurred. Please try again.' });
                }
            } else {
                setErrors({ general: 'An unexpected error occurred. Please try again.' });
            }
            setIsSubmitting(false);
        }
    };

    // If user is logged in but it's not their email, show a warning
    if (is_logged_in && current_user_email && current_user_email !== inviteData.email) {
        return (
            <>
                <Head title="Accept Invitation" />
                <AppShell>
                    <div className="flex flex-1 items-center justify-center p-4 md:p-8">
                        <Card className="w-full max-w-md">
                            <CardHeader className="text-center">
                                <CardTitle>Invitation for Different User</CardTitle>
                                <CardDescription>This invitation is for a different email address</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                                    <p className="text-sm text-yellow-800">
                                        You are currently logged in as <strong>{current_user_email}</strong>, 
                                        but this invitation is for <strong>{inviteData.email}</strong>.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <Button 
                                        onClick={() => router.post(`/${tenantId}/logout`)} 
                                        variant="outline" 
                                        className="w-full"
                                    >
                                        Logout and Accept Invitation
                                    </Button>
                                    <Button 
                                        onClick={() => router.visit(`/${tenantId}/dashboard`)} 
                                        className="w-full"
                                    >
                                        Continue to Dashboard
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </AppShell>
            </>
        );
    }

    return (
        <>
            <Head title="Accept Invitation" />

            <AppShell>
                <div className="flex flex-1 items-center justify-center p-4 md:p-8">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle>Accept Invitation</CardTitle>
                            <CardDescription>You have been invited to join our platform</CardDescription>
                        </CardHeader>

                        <CardContent>
                            {is_logged_in && (
                                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
                                    <p className="text-sm text-blue-800">
                                        You are currently logged in as <strong>{current_user_email}</strong>
                                    </p>
                                </div>
                            )}
                            
                            <div className="mb-6 rounded-lg bg-muted p-4">
                                <p className="mb-2 text-sm text-muted-foreground">Invitation Details:</p>
                                <p className="font-medium">{inviteData?.email}</p>
                                <p className="text-sm text-muted-foreground">Role: {inviteData.role?.name}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!is_present && (
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                        {errors.name && <InputError message={errors.name} />}
                                    </div>
                                )}

                                {!is_present && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Create a password"
                                                required
                                                minLength={8}
                                            />
                                            {errors.password && <InputError message={errors.password} />}
                                            <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={handleChange}
                                                placeholder="Confirm your password"
                                                required
                                                minLength={8}
                                            />
                                            {errors.password_confirmation && <InputError message={errors.password_confirmation} />}
                                        </div>
                                    </>
                                )}

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting 
                                        ? (is_present ? 'Accepting Invitation...' : 'Creating Account...') 
                                        : (is_present ? 'Accept Invitation' : 'Accept Invitation & Create Account')
                                    }
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </AppShell>
        </>
    );
}
