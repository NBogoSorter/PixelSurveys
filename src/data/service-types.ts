// Options for the "Service type" field on the contact forms.
//
// Derived from SERVICES rather than typed out again: these used to be a
// separate, simplified list, which drifted out of step with the services page
// ("Contours & Terrain Data" against "Contours & Terrain Models"). Deriving
// them means the form can only ever offer what the site actually sells.
//
// IMPORTANT: ALLOWED_SERVICES in public/api/quote.php must list exactly these
// titles. The handler drops any submitted value that isn't on its list, with
// no error anywhere, so a mismatch silently loses the service on every
// enquiry. Run `python scripts/check-service-types.py` after changing either.
import { SERVICES } from "./services";

export interface ServiceTypeOption {
  title: string;
  description: string;
}

export const SERVICE_TYPES: ServiceTypeOption[] = [
  ...SERVICES.map((service) => ({
    title: service.title,
    description: service.description,
  })),
  {
    title: "Other",
    description: "describe what you need in the message box below",
  },
];
