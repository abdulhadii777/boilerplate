<!DOCTYPE html>
<html lang="en">
<head>
    @include('emails.partials.head')
    @yield('additional-head')
</head>
<body>
    <div class="email-wrapper">
        @include('emails.partials.header', [
            'headerTitle' => $headerTitle ?? config('app.name'),
            'headerSubtitle' => $headerSubtitle ?? null
        ])

        <div class="email-body">
            @yield('content')
        </div>

        <div class="email-footer">
            @yield('footer-content')
        </div>
    </div>
</body>
</html>
