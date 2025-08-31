import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle, Building2, ArrowRight } from 'lucide-react';
import { InvitationAcceptedPageProps } from '@/features/users/types';

export default function InvitationAcceptedPage({ tenant, redirectUrl }: InvitationAcceptedPageProps) {
    return (
        <>
            <Head title="Invitation Accepted" />
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="mt-6 text-3xl font-bold tracking-tight">
                            Welcome to {tenant.name}!
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Your account has been created successfully and you're now a member of the organization.
                        </p>
                    </div>

                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center space-x-2">
                                <Building2 className="h-5 w-5" />
                                <span>{tenant.name}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground mb-6">
                                You can now access all the features and resources available to members of {tenant.name}.
                            </p>
                            
                            <Button 
                                onClick={() => window.location.href = redirectUrl}
                                className="w-full"
                            >
                                Go to Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
