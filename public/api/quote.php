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
 * Sends via authenticated SMTP through Microsoft 365 (PHPMailer, vendored in
 * ./lib/phpmailer/ - no Composer available on this host), not PHP's mail().
 * pixelsurveys.com.au's SPF record is "v=spf1 include:spf.protection.outlook.com
 * -all" - a hard fail - so mail sent any other way gets rejected as spoofed.
 * The sending mailbox needs "Authenticated SMTP" enabled for it in the
 * Microsoft 365 admin center (Users -> the mailbox -> Mail -> Manage email
 * apps); most tenants ship with it off. If the tenant also enforces Security
 * Defaults or a Conditional Access policy blocking basic auth entirely, this
 * won't authenticate and needs OAuth2 (XOAUTH2) instead - more setup, cross
 * that bridge only if plain SMTP AUTH turns out to be blocked.
 */

require __DIR__ . '/lib/phpmailer/Exception.php';
require __DIR__ . '/lib/phpmailer/SMTP.php';
require __DIR__ . '/lib/phpmailer/PHPMailer.php';

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

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

/** @var array{to_address: string, from_address: string, from_name: string, subject_prefix: string, allowed_origins: string[], rate_limit_dir: string, rate_limit_max: int, rate_limit_window: int, smtp_host: string, smtp_port: int, smtp_username: string, smtp_password: string} $config */
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

// --- Send (via Microsoft 365 SMTP - see the note at the top of this file) ---
$subject = $config['subject_prefix'] . ' ' . $name . ($service !== '' ? ' - ' . $service : '');

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

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->Port = $config['smtp_port'];
    $mail->SMTPAuth = true;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->CharSet = PHPMailer::CHARSET_UTF8;

    // From must be a real, authenticated mailbox (deliverability/SPF). The
    // visitor's address only ever goes in Reply-To, and it's already passed
    // FILTER_VALIDATE_EMAIL above.
    $mail->setFrom($config['from_address'], $config['from_name']);
    $mail->addAddress($config['to_address']);
    $mail->addReplyTo($email, $name);

    $mail->isHTML(false);
    $mail->Subject = $subject;
    $mail->Body = $body;

    $mail->send();
} catch (MailException $e) {
    error_log('quote.php: PHPMailer failed: ' . $mail->ErrorInfo);
    respond(false, 502, 'Your request could not be sent. Please email us directly.');
}

respond(true, 200);
