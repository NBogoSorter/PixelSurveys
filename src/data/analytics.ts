/**
 * GA4 measurement ID, supplied by the client 9 Oct 2026.
 *
 * Public on purpose, and committed rather than hidden. The tag runs in the
 * visitor's browser, so the browser has to be sent this value - it is in the
 * HTML of every page and readable with View Source on the live site. Putting
 * it in an environment variable would buy no secrecy and would add a way for
 * the tag to vanish silently from a build.
 *
 * It names a property; it does not open one. Reading the analytics needs a
 * Google account with permission on the property. Contrast ~/server-config/
 * quote-config.php, which holds the Graph private key: that one lets its
 * holder send mail as the client, so it lives outside every web root and is
 * never committed.
 *
 * Some Google values ARE secret and look similar - a Measurement Protocol API
 * secret, Google Ads API credentials, a server-side GTM key. None of those
 * belong here.
 */
export const GA_MEASUREMENT_ID = "G-JRY0F0GNKN";
