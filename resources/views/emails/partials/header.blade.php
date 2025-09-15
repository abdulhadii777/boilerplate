<div class="email-header">
    <h1 class="header-title">{{ $headerTitle ?? config('app.name') }}</h1>
    @if(isset($headerSubtitle))
        <p class="header-subtitle">{{ $headerSubtitle }}</p>
    @endif
    @yield('header-additional')
</div>