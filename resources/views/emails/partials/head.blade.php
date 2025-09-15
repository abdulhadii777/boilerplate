<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ $title ?? config('app.name') }}</title>
<style>
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
    }
    .email-wrapper {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        overflow: hidden;
    }
    .email-header {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        padding: 32px 24px;
        text-align: center;
        color: white;
    }
    .header-title {
        font-size: 24px;
        font-weight: bold;
        margin: 0 0 8px 0;
    }
    .header-subtitle {
        font-size: 14px;
        opacity: 0.8;
        margin: 0;
    }
    .email-body {
        padding: 32px 24px;
        background-color: #ffffff;
    }
    .email-footer {
        padding: 16px;
        text-align: center;
    }
    .footer-text {
        color: #6c757d;
        font-size: 14px;
        margin: 0 0 8px 0;
    }
    .content-section {
        margin-bottom: 24px;
    }
    .content-title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 16px 0;
    }
    .content-text {
        font-size: 16px;
        line-height: 1.8;
        color: #374151;
        margin: 0 0 16px 0;
    }
    .action-button {
        display: inline-block;
        background-color: #2563eb;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        text-align: center;
        transition: background-color 0.2s;
    }
    .action-button:hover {
        background-color: #1d4ed8;
    }
    .highlight {
        font-weight: 600;
        color: #111827;
    }
</style>
