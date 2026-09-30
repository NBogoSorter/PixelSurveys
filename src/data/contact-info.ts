export const CONTACT_EMAIL = "info@pixelsurveys.com.au";

/**
 * Domestic format, which is what almost every visitor to an Adelaide survey
 * firm's site is dialling from.
 *
 * It was "+61 0461 370 270" until 30 Sept 2026, which mixed conventions: the
 * "+61" is the international prefix, but the "0" after it is the domestic
 * trunk prefix, dropped when dialling from outside Australia. It was valid
 * neither way round. Dropping the "+61" leaves a correct domestic number, and
 * CONTACT_PHONE_DIAL below still carries the international form for tel:
 * links, so an overseas caller tapping it also connects.
 */
export const CONTACT_PHONE = "0461 370 270";

/**
 * The same number in E.164, for `tel:` links. Kept separate because stripping
 * the spaces out of the display string gives "+610461370270", which has that
 * trunk 0 still in it - some handsets and VoIP clients fail to dial it.
 */
export const CONTACT_PHONE_DIAL = "+61461370270";
