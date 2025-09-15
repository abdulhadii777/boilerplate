@extends('emails.layouts.mail')

@section('additional-head')
<style>
    .invite-specific {
        background-color: #f0f9ff;
        border-left: 4px solid #2563eb;
        padding: 16px;
        margin: 16px 0;
        border-radius: 0 6px 6px 0;
    }
</style>
@endsection

@section('content')
    <div class="content-section">
        <h2 class="content-title">Welcome to the Team! 🎉</h2>
        <p class="content-text">
            You've been invited by <span class="highlight">{{ $invitedBy }}</span> 
            to join {{ config('app.name', 'our platform') }}.
        </p>
        <p class="content-text">
            We're excited to have you on board and can't wait to see what we'll accomplish together!
        </p>
    </div>

    @if(isset($additionalInfo))
        <div class="content-section invite-specific">
            <h3 class="content-title">Additional Information</h3>
            <p class="content-text">{{ $additionalInfo }}</p>
        </div>
    @endif

    <div class="content-section" style="text-align: center;">
        <a href="{{ $acceptUrl }}" class="action-button">Accept Invitation</a>
        <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
            This invitation will expire in 7 days.
        </p>
    </div>
@endsection

@section('footer-content')
    @include('emails.partials.footer')
@endsection
