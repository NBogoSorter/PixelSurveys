<?php

declare(strict_types=1);

/**
 * Quote request handler for the Pixel Surveys contact form.
 *
 * Deployed at public_html/api/quote.php. Reads its settings from
 * ~/server-config/quote-config.php, which lives OUTSIDE the web root so the
 * recipient address and mailbox credentials are never downloadable.
 *
 * Responds with JSON when the request sends `Accept: application/json` (the
 * form's fetch() path); otherwise redirects to a static thanks/error page so
 * the form still works with JavaScript disabled.
 *
 * Sends via the Microsoft Graph API (POST .../sendMail), not SMTP. Two
 * reasons: pixelsurveys.com.au's SPF record is "v=spf1
 * include:spf.protection.outlook.com -all" - a hard fail - so mail sent any
 * way other than through Microsoft gets rejected as spoofed; and Microsoft
 * is retiring SMTP AUTH's username/password login entirely (existing
 * tenants lose it 31 Dec 2026, https://learn.microsoft.com/en-us/exchange/
 * clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-
 * exchange-online) - not worth building on something with a ~3 month
 * runway. Graph API is Microsoft's own listed replacement, and needs
 * nothing vendored - it's plain HTTPS via PHP's built-in curl.
 *
 * Requires an Entra ID app registration with the Mail.Send *application*
 * permission (admin-consented) - see README.md for the setup steps.
 *
 * Authenticates with a certificate (a signed JWT client assertion), not a
 * client secret - this tenant's policy blocks apps from creating secrets at
 * all. Hand-rolled below rather than pulled in as a library: it's ~15 lines
 * of base64url + json_encode + openssl_sign, not worth vendoring anything
 * for. See https://learn.microsoft.com/en-us/entra/identity-platform/certificate-credentials
 */

const MIN_SECONDS_TO_SUBMIT = 3;

/**
 * The only values the "Service type" field may submit. Anything else is
 * dropped rather than echoed into the email - the subject line is built from
 * these, so they must not be attacker-controlled free text.
 *
 * These are the four categories from src/data/services.ts, which is what the
 * form now derives its options from, plus the two catch-all options.
 *
 * MUST match src/data/service-types.ts exactly. A value missing here is
 * dropped silently - no error to the visitor, nothing in the log - so the
 * enquiry arrives with the service blank and nothing looks broken.
 * `python scripts/check-service-types.py` compares the two.
 */
const ALLOWED_SERVICES = [
    'Aerial Imagery & Mapping',
    'Contours & Terrain Models',
    'Volumes & Site Monitoring',
    '3D Models & Point Clouds',
    'Other',
    'Not sure',
];

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function respond(bool $ok, int $status, string $error = ''): never
{
    global $wantsJson;

    if ($wantsJson) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
        exit;
    }

    header('Location: ' . ($ok ? '/contact/thanks/' : '/contact/error/'), true, 303);
    exit;
}

/** Collapses a single-line field and strips anything that could break a mail header. */
function clean_line(mixed $value, int $maxLength): string
{
    $value = is_string($value) ? $value : '';
    $value = trim(preg_replace('/[\r\n\t]+/', ' ', $value) ?? '');

    return mb_substr($value, 0, $maxLength);
}

/** POSTs $fields as application/x-www-form-urlencoded or application/json and decodes the JSON response. */
function http_post_json(string $url, array $fields, array $headers = [], bool $asJson = false): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $asJson ? json_encode($fields) : http_build_query($fields),
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 15,
    ]);
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        throw new RuntimeException('cURL error: ' . $curlError);
    }
    if ($status < 200 || $status >= 300) {
        throw new RuntimeException("HTTP $status: " . substr((string) $raw, 0, 500));
    }

    $decoded = $raw === '' ? [] : json_decode($raw, true);

    return is_array($decoded) ? $decoded : [];
}

function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Builds the signed JWT that proves "this request really is from the app
 * holding the private key that pairs with the certificate uploaded to
 * Entra" - the certificate-auth equivalent of a client_secret string.
 */
function build_client_assertion_jwt(string $tenantId, string $clientId, string $certThumbprintHex, string $privateKeyPem): string
{
    // Tolerate a thumbprint copied with "::" or spaces (e.g. from openssl's -fingerprint
    // output) as well as the plain hex Entra's own UI shows.
    $thumbprintBinary = hex2bin(str_replace([':', ' '], '', $certThumbprintHex));
    if ($thumbprintBinary === false) {
        throw new RuntimeException('graph_cert_thumbprint is not valid hex.');
    }

    $header = ['alg' => 'RS256', 'typ' => 'JWT', 'x5t' => base64url_encode($thumbprintBinary)];
    $now = time();
    $claims = [
        'aud' => "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token",
        'iss' => $clientId,
        'sub' => $clientId,
        'jti' => bin2hex(random_bytes(16)),
        'nbf' => $now,
        'exp' => $now + 300, // Entra allows up to 10 minutes; one token request needs far less.
    ];

    $signingInput = base64url_encode(json_encode($header)) . '.' . base64url_encode(json_encode($claims));

    $privateKey = openssl_pkey_get_private($privateKeyPem);
    if ($privateKey === false) {
        throw new RuntimeException('graph_private_key could not be read: ' . openssl_error_string());
    }
    $signed = openssl_sign($signingInput, $signature, $privateKey, OPENSSL_ALGO_SHA256);
    if (!$signed) {
        throw new RuntimeException('Failed to sign the client assertion JWT.');
    }

    return $signingInput . '.' . base64url_encode($signature);
}

/** Client-credentials OAuth2 flow - no user ever signs in, this app authenticates as itself. */
function get_graph_access_token(string $tenantId, string $clientId, string $certThumbprintHex, string $privateKeyPem): string
{
    $assertion = build_client_assertion_jwt($tenantId, $clientId, $certThumbprintHex, $privateKeyPem);

    $response = http_post_json(
        "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token",
        [
            'client_id' => $clientId,
            'scope' => 'https://graph.microsoft.com/.default',
            'client_assertion_type' => 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            'client_assertion' => $assertion,
            'grant_type' => 'client_credentials',
        ],
    );

    if (!isset($response['access_token']) || !is_string($response['access_token'])) {
        throw new RuntimeException('Token response had no access_token.');
    }

    return $response['access_token'];
}

/** Sends as $fromMailbox (must be a real mailbox the app is allowed to send as). */
function send_graph_mail(string $accessToken, string $fromMailbox, string $fromName, string $to, string $subject, string $body, string $replyToEmail, string $replyToName): void
{
    $endpoint = 'https://graph.microsoft.com/v1.0/users/' . rawurlencode($fromMailbox) . '/sendMail';
    $message = [
        'message' => [
            'subject' => $subject,
            'body' => ['contentType' => 'Text', 'content' => $body],
            // Without an explicit "from", Exchange labels the message with the
            // sending mailbox's own display name - which is the mailbox
            // owner's personal name when from_mailbox is an alias rather than
            // a mailbox of its own. Setting it keeps the sender reading as the
            // website. The address stays the mailbox we're authorised to send
            // as; only the display name is ours to choose.
            'from' => ['emailAddress' => ['address' => $fromMailbox, 'name' => $fromName]],
            'toRecipients' => [['emailAddress' => ['address' => $to]]],
            'replyTo' => [['emailAddress' => ['address' => $replyToEmail, 'name' => $replyToName]]],
        ],
        'saveToSentItems' => false,
    ];

    http_post_json($endpoint, $message, [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json',
    ], asJson: true);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 405, 'Method not allowed.');
}

// Resolve the cPanel account home rather than assuming how deep the docroot is -
// a staging subdomain may live at ~/staging.example.com or ~/public_html/staging.
$home = function_exists('posix_getpwuid') ? (posix_getpwuid(posix_geteuid())['dir'] ?? '') : '';
if ($home === '' || !is_dir($home)) {
    $home = dirname(__DIR__, 2);
}
$configPath = $home . '/server-config/quote-config.php';
if (!is_readable($configPath)) {
    error_log('quote.php: config not found at ' . $configPath);
    respond(false, 500, 'The form is not configured yet. Please email us directly.');
}

/** @var array{to_address: string, from_mailbox: string, from_name: string, subject_prefix: string, allowed_origins: string[], rate_limit_dir: string, rate_limit_max: int, rate_limit_window: int, graph_tenant_id: string, graph_client_id: string, graph_cert_thumbprint: string, graph_private_key: string} $config */
$config = require $configPath;

// Reject cross-site posts. Browsers send Origin on POST; if it's present it must be ours.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $config['allowed_origins'], true)) {
    respond(false, 403, 'Request rejected.');
}

// Honeypot filled in: almost certainly a bot. Pretend success so it doesn't retry.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(true, 200);
}

// Submitted implausibly fast after page load (only checked when JS set the timestamp).
$ts = (int) ($_POST['ts'] ?? 0);
if ($ts > 0 && (time() - $ts) < MIN_SECONDS_TO_SUBMIT) {
    respond(true, 200);
}

// --- Rate limit: N submissions per IP per window, stored outside the web root ---
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateDir = $config['rate_limit_dir'];
if (!is_dir($rateDir) && !mkdir($rateDir, 0700, true) && !is_dir($rateDir)) {
    error_log('quote.php: cannot create rate limit dir ' . $rateDir);
} else {
    $rateFile = $rateDir . '/' . hash('sha256', $ip) . '.json';
    $handle = fopen($rateFile, 'c+');
    if ($handle !== false && flock($handle, LOCK_EX)) {
        $raw = stream_get_contents($handle);
        $hits = json_decode($raw === false || $raw === '' ? '[]' : $raw, true);
        $hits = is_array($hits) ? $hits : [];
        $windowStart = time() - $config['rate_limit_window'];
        $hits = array_values(array_filter($hits, static fn ($t) => is_int($t) && $t > $windowStart));

        if (count($hits) >= $config['rate_limit_max']) {
            flock($handle, LOCK_UN);
            fclose($handle);
            respond(false, 429, 'Too many requests. Please try again later or email us directly.');
        }

        $hits[] = time();
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($hits));
        fflush($handle);
        flock($handle, LOCK_UN);
    }
    if ($handle !== false) {
        fclose($handle);
    }
}

// --- Validate ---
$name = clean_line($_POST['name'] ?? '', 100);
$email = clean_line($_POST['email'] ?? '', 254);
$phone = clean_line($_POST['phone'] ?? '', 40);
$company = clean_line($_POST['company'] ?? '', 100);

// The form posts services[] (checkboxes, zero or more). Only values on the
// allow-list survive, so a hand-crafted POST can't inject arbitrary text.
// array_unique guards against a hand-rolled POST repeating one value to pad
// the "+N more" count in the subject line.
$services = array_values(array_unique(array_intersect(
    array_map(
        static fn ($v) => clean_line($v, 100),
        is_array($_POST['services'] ?? null) ? $_POST['services'] : [],
    ),
    ALLOWED_SERVICES,
)));
$service = implode(', ', $services);
$message = is_string($_POST['message'] ?? null) ? trim($_POST['message']) : '';
$message = mb_substr(str_replace("\r\n", "\n", $message), 0, 5000);

if ($name === '') {
    respond(false, 422, 'Please enter your name.');
}
if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    respond(false, 422, 'Please enter a valid email address.');
}
if ($phone !== '' && preg_match('/^[0-9+()\-.\s]{6,40}$/', $phone) !== 1) {
    respond(false, 422, 'Please check the phone number.');
}
if (mb_strlen($message) < 10) {
    respond(false, 422, 'Please add a few details about your project.');
}

// --- Send (via Microsoft Graph - see the note at the top of this file) ---
// Kept short enough to read in an inbox list: the first service plus a count,
// rather than all of them running off the end of the subject line.
$serviceLabel = match (count($services)) {
    0 => 'General enquiry',
    1 => $services[0],
    default => $services[0] . ' +' . (count($services) - 1) . ' more',
};

// TEMPORARY: "[Site Location]" and "[Quote Number]" are literal placeholder
// text, not variables. The agreed subject format is
//
//     Quote Request: [Service] - [Site Location] | [Quote Number]
//
// but the form collects neither value yet: the site location field was
// removed at the client's request, and no reference numbering exists. The
// format is locked in now so the client can see it; the placeholders are
// filled in when those two features are built.
//
// MUST NOT SHIP TO A LIVE, PUBLIC SITE. A real customer enquiry arriving
// with "[Site Location]" in the subject reads as broken. See README.md,
// "Before launch".
$subject = $config['subject_prefix'] . ' ' . $serviceLabel . ' – [Site Location] | [Quote Number]';

$body = implode("\n", [
    'New quote request from the website',
    '',
    'Name:     ' . $name,
    'Email:    ' . $email,
    'Phone:    ' . ($phone !== '' ? $phone : '-'),
    'Company:  ' . ($company !== '' ? $company : '-'),
    'Services: ' . ($service !== '' ? $service : 'None selected'),
    '',
    'Message:',
    $message,
    '',
    '--',
    'Sent ' . gmdate('Y-m-d H:i') . ' UTC from ' . $ip,
]);

try {
    $accessToken = get_graph_access_token(
        $config['graph_tenant_id'],
        $config['graph_client_id'],
        $config['graph_cert_thumbprint'],
        $config['graph_private_key'],
    );

    // Sends as $config['from_mailbox'] itself (deliverability/SPF - a real,
    // authenticated mailbox). The visitor's address only ever goes in
    // Reply-To, and it's already passed FILTER_VALIDATE_EMAIL above.
    send_graph_mail(
        $accessToken,
        $config['from_mailbox'],
        // Fallback so an older config file without this key still sends,
        // rather than failing with a TypeError.
        $config['from_name'] ?? 'Pixel Surveys Website',
        $config['to_address'],
        $subject,
        $body,
        $email,
        $name,
    );
} catch (Throwable $e) {
    error_log('quote.php: Graph send failed: ' . $e->getMessage());
    respond(false, 502, 'Your request could not be sent. Please email us directly.');
}

respond(true, 200);
