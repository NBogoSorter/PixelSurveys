<?php

/**
 * Settings for public_html/api/quote.php.
 *
 * On the server: copy this to ~/server-config/quote-config.php (next to
 * public_html, NOT inside it) and fill in real values. The real file is
 * git-ignored and is never uploaded by the deploy workflow.
 */

return [
    // Where quote requests are delivered.
    'to_address' => 'enquiries@pixelsurveys.com',

    // Must be a mailbox that exists in this cPanel account, or mail may be rejected as spoofed.
    'from_address' => 'website@pixelsurveys.com',
    'from_name' => 'Pixel Surveys Website',

    'subject_prefix' => '[Quote request]',

    // Exact origins allowed to post the form (scheme + host, no trailing slash).
    'allowed_origins' => [
        'https://pixelsurveys.com',
        'https://www.pixelsurveys.com',
        'https://staging.pixelsurveys.com',
    ],

    // Outside the web root. dirname(__DIR__) here is the account home directory.
    'rate_limit_dir' => dirname(__DIR__) . '/tmp/quote-rate-limit',
    'rate_limit_max' => 5,
    'rate_limit_window' => 3600,
];
