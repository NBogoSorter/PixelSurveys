<?php

/**
 * Settings for public_html/api/quote.php.
 *
 * On the server: copy this to ~/server-config/quote-config.php (next to
 * public_html, NOT inside it) and fill in real values. The real file is
 * git-ignored and is never uploaded by the deploy workflow.
 *
 * Mail sends through the Microsoft Graph API (pixelsurveys.com.au's SPF
 * record only permits mail from Microsoft's own servers - see the note at
 * the top of quote.php). The graph_* fields below are real app credentials
 * - this file staying outside the web root is what keeps them from being
 * downloadable.
 *
 * Before this works, an Entra ID app registration is needed (README.md has
 * the full walkthrough): Entra admin center -> App registrations -> New
 * registration -> API permissions -> add Microsoft Graph -> Application
 * permissions -> Mail.Send -> Grant admin consent -> Certificates & secrets
 * -> New client secret. Then:
 *   graph_tenant_id     = the app's "Directory (tenant) ID"
 *   graph_client_id     = the app's "Application (client) ID"
 *   graph_client_secret = the client secret's VALUE (shown once, at creation)
 */

return [
    // Reusing one mailbox for both sending and receiving keeps this to a
    // single M365 mailbox - no second one to create/license. Split them
    // (e.g. a dedicated website@) only if the client wants that separation.
    'to_address' => 'info@pixelsurveys.com.au',
    'from_mailbox' => 'info@pixelsurveys.com.au',
    'from_name' => 'Pixel Surveys Website',

    'subject_prefix' => '[Quote request]',

    // --- Microsoft Graph API (app-only auth, no user signs in) ---
    'graph_tenant_id' => 'REPLACE_WITH_DIRECTORY_TENANT_ID',
    'graph_client_id' => 'REPLACE_WITH_APPLICATION_CLIENT_ID',
    'graph_client_secret' => 'REPLACE_WITH_CLIENT_SECRET_VALUE',

    // Exact origins allowed to post the form (scheme + host, no trailing slash).
    // No staging entry - there's no staging environment in this setup.
    'allowed_origins' => [
        'https://pixelsurveys.com.au',
        'https://www.pixelsurveys.com.au',
    ],

    // Outside the web root. dirname(__DIR__) here is the account home directory.
    'rate_limit_dir' => dirname(__DIR__) . '/tmp/quote-rate-limit',
    'rate_limit_max' => 5,
    'rate_limit_window' => 3600,
];
