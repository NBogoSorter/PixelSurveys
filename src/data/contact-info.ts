export const CONTACT_EMAIL = "info@pixelsurveys.com.au";

/**
 * As the client wrote it, so the page shows their preferred format.
 *
 * Note it mixes conventions: "+61" is the international prefix, but the "0"
 * after it is the domestic trunk prefix, which is dropped when dialling from
 * outside Australia. Written strictly it would be either "0461 370 270"
 * (domestic) or "+61 461 370 270" (international), not both.
 */
export const CONTACT_PHONE = "+61 0461 370 270";

/**
 * The same number in E.164, for `tel:` links. Kept separate because stripping
 * the spaces out of the display string gives "+610461370270", which has that
 * trunk 0 still in it - some handsets and VoIP clients fail to dial it.
 */
export const CONTACT_PHONE_DIAL = "+61461370270";
