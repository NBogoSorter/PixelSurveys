<?php

/**
 * Settings for public_html/api/quote.php.
 *
 * On the server: copy this to ~/server-config/quote-config.php (next to
 * public_html, NOT inside it) and fill in real values. The real file is
 * git-ignored and is never uploaded by the deploy workflow.
 *
 * Mail sends through Microsoft 365's SMTP (pixelsurveys.com.au's SPF record
 * only permits mail from Microsoft's own servers - see the note at the top
 * of quote.php). The smtp_* fields below are real mailbox credentials -
 * this file staying outside the web root is what keeps them from being
 * downloadable.
 *
 * Before this works, the sending mailbox needs "Authenticated SMTP" turned
 * on: Microsoft 365 admin center -> Users -> (the mailbox) -> Mail ->
 * Manage email apps -> enable "Authenticated SMTP". Most tenants ship with
 * this off. If sign-in still fails after that, the mailbox likely has MFA
 * enabled and needs an app password instead of its normal password (M365
 * admin center -> the user -> Authentication methods).
 */

return [
    // Reusing one mailbox for both sending and receiving keeps this to a
    // single M365 mailbox - no second one to create/license. Split them
    // (e.g. a dedicated website@) only if the client wants that separation.
    'to_address' => 'info@pixelsurveys.com.au',
    'from_address' => 'info@pixelsurveys.com.au',
    'from_name' => 'Pixel Surveys Website',

    'subject_prefix' => '[Quote request]',

    // --- Microsoft 365 SMTP (authenticated) ---
    'smtp_host' => 'smtp.office365.com',
    'smtp_port' => 587,
    'smtp_username' => 'info@pixelsurveys.com.au', // usually same as from_address
    'smtp_password' => 'REPLACE_WITH_MAILBOX_PASSWORD_OR_APP_PASSWORD',

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
