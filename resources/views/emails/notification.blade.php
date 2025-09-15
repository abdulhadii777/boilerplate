@extends('emails.layouts.mail')

@section('additional-head')
<style>
    .notification-specific {
        background-color: #f0f9ff;
        border-left: 4px solid #2563eb;
        padding: 16px;
        margin: 16px 0;
        border-radius: 0 6px 6px 0;
    }

    .notification-data {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 12px;
        margin: 16px 0;
    }

    .notification-data-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #e2e8f0;
    }

    .notification-data-item:last-child {
        border-bottom: none;
    }

    .notification-data-label {
        font-weight: 600;
        color: #374151;
    }

    .notification-data-value {
        color: #6b7280;
    }

    .action-section {
        text-align: center;
        margin: 24px 0;
    }

    .action-button {
        display: inline-block;
        background-color: #2563eb;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 16px 0;
    }

    .action-button:hover {
        background-color: #1d4ed8;
    }
</style>
@endsection

@section('content')
    <div class="content-section">
        <p class="content-text">
            {{ $notificationMessage }}
        </p>
    </div>

    @if($actionUrl && $actionText)
        <div class="action-section">
            <a href="{{ $actionUrl }}" class="action-button">{{ $actionText }}</a>
        </div>
    @endif

    <div class="content-section">
        <p class="content-text" style="font-size: 14px; color: #6b7280;">
            This notification was sent from {{ config('app.name', 'our platform') }}.
        </p>
    </div>
@endsection

@section('footer-content')
    @include('emails.partials.footer')
    <p class="footer-text">You can manage your notification preferences in your account settings.</p>
@endsection
