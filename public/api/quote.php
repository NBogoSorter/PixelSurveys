<?php

declare(strict_types=1);

/**
 * Quote request handler for the Pixel Surveys contact form.
 *
 * Deployed at public_html/api/quote.php. Reads its settings from
 * ~/server-config/quote-config.php, which lives OUTSIDE the web root so the
 * recipient address and limits are never downloadable.
 *
 * Responds with JSON when the request sends `Accept: application/json` (the
 * form's fetch() path); otherwise redirects to a static thanks/error page so
 * the form still works with JavaScript disabled.
 */

const MIN_SECONDS_TO_SUBMIT = 3;

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

/** @var array{to_address: string, from_address: string, from_name: string, subject_prefix: string, allowed_origins: string[], rate_limit_dir: string, rate_limit_max: int, rate_limit_window: int} $config */
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
$service = clean_line($_POST['service'] ?? '', 100);
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

// --- Send ---
$subject = $config['subject_prefix'] . ' ' . $name . ($service !== '' ? ' - ' . $service : '');
$encodedSubject = mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");

$body = implode("\n", [
    'New quote request from the website',
    '',
    'Name:    ' . $name,
    'Email:   ' . $email,
    'Phone:   ' . ($phone !== '' ? $phone : '-'),
    'Service: ' . ($service !== '' ? $service : 'Not sure yet'),
    '',
    'Project details:',
    $message,
    '',
    '--',
    'Sent ' . gmdate('Y-m-d H:i') . ' UTC from ' . $ip,
]);

// From must be a real mailbox on this domain (deliverability/SPF). The visitor's
// address only ever goes in Reply-To, and it has already passed FILTER_VALIDATE_EMAIL.
$headers = implode("\r\n", [
    'From: ' . mb_encode_mimeheader($config['from_name'], 'UTF-8', 'B') . ' <' . $config['from_address'] . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$sent = mail($config['to_address'], $encodedSubject, $body, $headers, '-f' . $config['from_address']);

if (!$sent) {
    error_log('quote.php: mail() returned false');
    respond(false, 502, 'Your request could not be sent. Please email us directly.');
}

respond(true, 200);
