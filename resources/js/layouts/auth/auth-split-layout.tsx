import AppLogoIcon from '@/components/layout/app-logo-icon';
import { type MainPageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps extends PropsWithChildren {
    title?: string;
    description?: string;
    name?: string;
    quote?: {
        message: string;
        author: string;
    };
}

export function AuthSplitLayout({ children, name, quote, description }: AuthLayoutProps) {
    const page = usePage<MainPageProps>();
    const pageName = page.props.name as string | undefined;
    const pageQuote = page.props.quote as { message: string; author: string } | undefined;

    const displayName = name || pageName || 'App';
    const displayQuote = quote || pageQuote;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    <AppLogoIcon className="mr-2 size-8 fill-current text-white" />
                    {displayName}
                </Link>
                {displayQuote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{displayQuote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300">{displayQuote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{displayName}</h1>
                        <p className="text-sm text-balance text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
