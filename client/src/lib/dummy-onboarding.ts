export type AccountTypeId = "personal" | "professional" | "artisan" | "business" | "organization";

export interface AccountType {
  id: AccountTypeId;
  title: string;
  description: string;
  icon: string;
  /** Some design icons are exported upside-down and are flipped back when drawn. */
  iconFlipped?: boolean;
  features: string[];
  duration: string;
  hint?: string;
  /** One line for the compact role picker. */
  tagline?: string;
  /** First screen of this type's setup; types without a designed setup go straight to the app. */
  setupHref?: string;
}

export const ACCOUNT_TYPES: AccountType[] = [
  {
    id: "personal",
    title: "Personal",
    description: "Find a home or a stay, or hire someone to build or fix things.",
    icon: "/icons/onboarding-user.svg",
    features: ["Save homes and get price alerts", "Book stays and viewings", "Hire professionals and artisans"],
    duration: "About 1 min",
    hint: "Most people start here",
    setupHref: "/onboarding/personal",
  },
  {
    id: "professional",
    tagline: "Licensed experts who offer services and quotes",
    title: "Professional",
    description: "Architects, engineers, surveyors, agents and other licensed experts.",
    icon: "/icons/briefcase-01.svg",
    setupHref: "/onboarding/professional",
    features: ["A verified professional profile", "Offer services and send quotes", "Win leads from the Request Board"],
    duration: "About 4 min",
  },
  {
    id: "artisan",
    tagline: "Trades who take jobs and show a portfolio",
    title: "Artisan",
    description: "Electricians, plumbers, masons, carpenters, tilers, painters and other trades.",
    icon: "/icons/onboarding-wrench.svg",
    setupHref: "/onboarding/artisan",
    features: ["Show your work in a portfolio", "Get job requests near you", "Get paid and build reviews"],
    duration: "About 3 min",
  },
  {
    id: "business",
    tagline: "A storefront for an agency, supplier or stay operator",
    title: "Business",
    description: "Estate agencies, building suppliers, equipment hire and stay operators.",
    icon: "/icons/onboarding-building.svg",
    iconFlipped: true,
    setupHref: "/onboarding/business",
    features: ["A business page and storefront", "List properties, stays or products", "Take enquiries, orders and bookings"],
    duration: "About 5 min",
  },
  {
    id: "organization",
    tagline: "A company or institution with branches and staff",
    title: "Organisation",
    description: "Developers, property managers, estates and institutions that work as a team.",
    icon: "/icons/onboarding-city.svg",
    iconFlipped: true,
    setupHref: "/onboarding/organization",
    features: ["Add branches and locations", "Invite staff with the right access", "Run it all from Manage"],
    duration: "About 6 min",
  },
];

/** Mock: the name of the account that just signed up. */
export const NEW_ACCOUNT_NAME = "Madeline";

export interface PersonalInterest {
  id: string;
  label: string;
  /** The label used in summaries, e.g. "Rent". */
  short: string;
}

export const PERSONAL_INTERESTS: PersonalInterest[] = [
  { id: "buy", short: "Buy", label: "Buy a home" },
  { id: "rent", short: "Rent", label: "Rent a home" },
  { id: "stay", short: "Stay", label: "Book a stay" },
  { id: "explore", short: "Explore", label: "Just explore" },
];

export const PERSONAL_STEPS = [
  { id: "interests", title: "Interests", note: "What you are looking for" },
  { id: "location", title: "Location", note: "Choose your location" },
  { id: "profile", title: "Your profile", note: "Photo and short intro" },
];

/** The most places someone can add to their setup. */
export const MAX_PERSONAL_PLACES = 8;

/** What each part of the profile adds to its completeness, beside the 20% every new account starts with. */
export const PROFILE_COMPLETION = { base: 20, interests: 5, location: 50, profile: 25 };

export const PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png"];
export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const INTRO_MAX_LENGTH = 160;
export const INTRO_EXAMPLE = "Relocating to Accra in March. Looking for a 2-bed to rent while we build in Oyarifa.";

/** Mock: what is already known about the account that just signed up. */
export const NEW_ACCOUNT_PROFILE = {
  displayName: "Madeline Price",
  whatsapp: "+233 20 812 4471",
  email: "madeline.price@gmail.com",
  joined: "Oct 2026",
};

/** Someone who works independently has no company or firm to describe, so that step is left out. */
export function professionalSteps(independent: boolean) {
  return independent ? PROFESSIONAL_STEPS.filter((step) => step.id !== "firm") : PROFESSIONAL_STEPS;
}

/** What each finished professional step adds to the profile; together they make 100%. */
export const PROFESSIONAL_COMPLETION = { profession: 5, firm: 50, credentials: 20, public: 25 };

export const PROFESSIONAL_STEPS = [
  { id: "profession", title: "Your profession", note: "What you do and where" },
  { id: "firm", title: "Company/Firm", note: "Firm details" },
  { id: "credentials", title: "Credentials", note: "Registration and identity" },
  { id: "public", title: "Public profile", note: "Photo, intro and portfolio" },
];

export const PROFESSIONS = [
  "Architect",
  "Civil or structural engineer",
  "Quantity surveyor",
  "Land surveyor",
  "Real estate agent",
  "Property lawyer",
  "Valuer",
  "Interior designer",
  "Project manager",
];

export const EXPERIENCE_OPTIONS = ["Less than 1 year", "1 year", ...Array.from({ length: 18 }, (_, index) => `${index + 2} years`), "20+ years"];

export const WORK_MODES = [
  { id: "independent", label: "I work independently", icon: "/icons/onboarding-user.svg", iconClass: undefined },
  { id: "firm", label: "I work at a firm", icon: "/icons/onboarding-building-01.svg", iconClass: "-scale-y-100" },
] as const;

/** Mock: the person who just signed up as a professional. */
export const NEW_PROFESSIONAL = { name: "Ama Owusu", firm: "Owusu & Partners Studio", basedIn: "Osu, Accra" };

export interface OfferedService {
  label: string;
  /** The shorter name shown on the profile preview. */
  short?: string;
}

/** What each profession typically offers; only architects are designed, the rest share a generic list. */
export const SERVICES_BY_PROFESSION: Record<string, OfferedService[]> = {
  Architect: [
    { label: "Architectural design" },
    { label: "Building permit drawings", short: "Permit drawings" },
    { label: "3D visualisation" },
    { label: "Renovation design" },
    { label: "Site supervision" },
    { label: "Interior layout" },
    { label: "Feasibility study" },
  ],
};

export const GENERIC_SERVICES: OfferedService[] = [{ label: "Consultation" }, { label: "Site inspection" }, { label: "Reports and documents" }, { label: "Project supervision" }];

/** Ghana's 16 regions, and working remotely. */
export const WORK_REGIONS = [
  { label: "Greater Accra", short: "Greater Accra" },
  { label: "Ashanti", short: "Ashanti" },
  { label: "Western", short: "Western" },
  { label: "Western North", short: "Western North" },
  { label: "Central", short: "Central" },
  { label: "Eastern", short: "Eastern" },
  { label: "Volta", short: "Volta" },
  { label: "Oti", short: "Oti" },
  { label: "Northern", short: "Northern" },
  { label: "Savannah", short: "Savannah" },
  { label: "North East", short: "North East" },
  { label: "Upper East", short: "Upper East" },
  { label: "Upper West", short: "Upper West" },
  { label: "Bono", short: "Bono" },
  { label: "Bono East", short: "Bono East" },
  { label: "Ahafo", short: "Ahafo" },
  { label: "Remote / online", short: "Remote" },
];

/** Mock: how many open requests match, shown in the tip. */
export const MATCHING_REQUESTS = 12;

export interface BodyOption {
  label: string;
  /** The short form used on badges, e.g. "ARC". */
  abbreviation: string;
}

/** The registration bodies and professional associations; only architects are designed, other professions type theirs in. */
export const REGISTRATION_BODIES: Record<string, BodyOption[]> = {
  Architect: [{ label: "Architects Registration Council (ARC)", abbreviation: "ARC" }],
};
export const MEMBERSHIP_BODIES: Record<string, BodyOption[]> = {
  Architect: [{ label: "Ghana Institute of Architects", abbreviation: "GIA" }],
};

export const CREDENTIAL_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const CREDENTIAL_FILE_MAX_BYTES = 10 * 1024 * 1024;

export const ARTISAN_STEPS = [
  { id: "trade", title: "Your trade", note: "What you do and your team" },
  { id: "area", title: "Work area", note: "Where and when you work" },
  { id: "verification", title: "Verification", note: "ID and trade licences" },
  { id: "portfolio", title: "Portfolio and prices", note: "Photos and starting prices" },
];

export const TRADES = [
  "Electrician",
  "Plumber",
  "Mason",
  "Carpenter",
  "Tiler",
  "Painter",
  "Welder and fabricator",
  "Roofer",
  "AC technician",
  "POP and ceilings",
  "Aluminium and glass",
  "Landscaper",
];

export const TEAM_SIZES = ["2 people", "3 people", "4 people", "5 people", "6 to 10 people", "More than 10 people"];

/** Mock: the person who just signed up as an artisan. */
export const NEW_ARTISAN = { name: "Kofi Asante", basedIn: "Madina, Accra" };

export const TRAVEL_DISTANCES = ["5 km", "10 km", "20 km", "Anywhere in Greater Accra"];
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const WORKING_HOURS = ["6:00 am – 4:00 pm", "7:00 am – 6:00 pm", "8:00 am – 5:00 pm", "9:00 am – 6:00 pm", "Open all day"];

/** How a trade reads in "open ___ requests". */
export const TRADE_REQUEST_WORD: Record<string, string> = { Electrician: "electrical", Plumber: "plumbing", Carpenter: "carpentry", Painter: "painting", Roofer: "roofing" };

/** Mock: the artisan's WhatsApp number and how many open requests match. */
export const ARTISAN_WHATSAPP = "+233 24 551 0932";
export const MATCHING_ARTISAN_REQUESTS = 9;

/** The wiring licence classes an electrician can hold. */
export const LICENCE_CLASSES = ["Domestic", "Commercial", "Industrial"];

/** Example services shown as placeholders in the starting prices; only electricians are designed, the rest share a generic set. */
export const PRICE_EXAMPLES: Record<string, string[]> = {
  Electrician: ["Socket or switch installation", "Full rewiring, 3-bedroom house", "Fault finding and repair"],
  default: ["A job you do often", "A bigger job", "A repair or call-out"],
};

export const BUSINESS_STEPS = [
  { id: "type", title: "Business type", note: "What kind of business" },
  { id: "details", title: "Business details", note: "Name, contacts and location" },
  { id: "verification", title: "Verification", note: "Registration and owner ID" },
];

export interface BusinessType {
  id: string;
  title: string;
  note: string;
  icon: string;
  iconClass?: string;
  /** How the business reads under its name in the preview, e.g. "Building materials". */
  category: string;
  /** What the preview calls the things it will list. */
  offers: string;
}

export const BUSINESS_TYPES: BusinessType[] = [
  { id: "agency", title: "Estate agency", note: "List and market homes for owners", icon: "/icons/onboarding-house-01.svg", iconClass: "-scale-y-100", category: "Estate agency", offers: "Listings" },
  { id: "supplies", title: "Building supplies", note: "Sell cement, tiles, roofing and more", icon: "/icons/onboarding-building.svg", iconClass: "-scale-y-100", category: "Building materials", offers: "Products" },
  { id: "hire", title: "Equipment hire", note: "Rent out excavators, scaffolding and mixers", icon: "/icons/onboarding-crane.svg", category: "Equipment hire", offers: "Equipment" },
  { id: "stay", title: "Stay operator", note: "Hotels, guesthouses and short-lets", icon: "/icons/onboarding-hotel.svg", category: "Stays", offers: "Rooms" },
  { id: "logistics", title: "Logistics and haulage", note: "Move materials to sites", icon: "/icons/onboarding-truck.svg", category: "Logistics and haulage", offers: "Services" },
  { id: "other", title: "Something else", note: "Tell us in a few words", icon: "/icons/briefcase-01.svg", category: "Business", offers: "Offers" },
];

/** Mock: the business that is being set up. */
export const NEW_BUSINESS = { name: "Adom Building Supplies", location: "Spintex, Accra" };

export const BUSINESS_CATEGORIES = ["Building materials", "Estate agency", "Equipment hire", "Stays", "Logistics and haulage", "Other"];
export const BUSINESS_HOURS = ["Mon–Fri, 8:00 am – 5:00 pm", "Mon–Sat, 7:30 am – 5:30 pm", "Every day, 8:00 am – 8:00 pm", "Open 24 hours", "By appointment"];
export const LOGO_MIN_SIZE = 400;

export const SUPPLY_CATEGORIES = ["Cement", "Iron rods", "Roofing sheets", "Tiles", "Paint", "Plumbing", "Electrical", "Doors and windows"];
export const PRODUCT_UNITS = ["per bag", "per length", "per piece", "per roll", "per tonne", "per litre", "per carton", "per sheet"];
export const DELIVERY_OPTIONS = [
  { id: "deliver", title: "We deliver", note: "Greater Accra and Tema", icon: "/icons/onboarding-truck.svg", preview: "Delivers in Accra" },
  { id: "pickup", title: "Pickup only", note: "Customers collect from your shop", icon: "/icons/onboarding-building.svg", iconClass: "-scale-y-100", preview: "Pickup only" },
] as const;

export const OWNER_ROLES = ["Owner and director", "Owner", "Director", "Manager", "Authorised representative"];

/** Mock: the signed-in person setting the business up. */
export const BUSINESS_OWNER_NAME = "Yaw Adomako";

export interface BusinessPlan {
  id: "free" | "pro" | "business" | "enterprise";
  name: string;
  price: string;
  /** "/month" for priced plans; empty for custom pricing. */
  per: string;
  note: string;
  badge?: string;
  features: string[];
  /** The main button once this plan is chosen. */
  action: string;
}

export const BUSINESS_PLANS: BusinessPlan[] = [
  { id: "free", name: "Free", price: "GHS 0", per: "/month", note: "To get started", features: ["Business page", "Up to 10 products", "Enquiries and messages"], action: "Continue with Free" },
  { id: "pro", name: "Pro", price: "GHS 149", per: "/month", note: "For growing shops", badge: "Recommended", features: ["Unlimited products", "Orders and quotes", "Sales analytics", "Promote listings"], action: "Start 14-day Pro trial" },
  { id: "business", name: "Business", price: "GHS 599", per: "/month", note: "For high volume", features: ["Everything in Pro", "Inventory and stock alerts", "Accounting integration", "Priority support"], action: "Start 14-day Business trial" },
  { id: "enterprise", name: "Enterprise", price: "Custom", per: "", note: "For large operations", features: ["Everything in Business", "API and webhooks", "Dedicated manager"], action: "Contact sales" },
];

export const ORGANIZATION_STEPS = [
  { id: "organization", title: "Organization", note: "Type, name and head office" },
  { id: "verification", title: "Verification", note: "Incorporation and authority" },
];

export const ORGANIZATION_TYPES = [
  { id: "developer", title: "Property developer", note: "Projects, units and sales teams", icon: "/icons/onboarding-crane.svg", iconClass: undefined },
  { id: "management", title: "Property management company", note: "Manage homes and estates for owners", icon: "/icons/onboarding-building-01.svg", iconClass: "-scale-y-100" },
  { id: "estate", title: "Estate or residents’ association", note: "Gated communities and estate boards", icon: "/icons/onboarding-house-01.svg", iconClass: "-scale-y-100" },
  { id: "institution", title: "Institution or NGO", note: "Schools, churches, charities with property", icon: "/icons/onboarding-school.svg", iconClass: undefined },
  { id: "government", title: "Government or public agency", note: "Housing, planning and lands bodies", icon: "/icons/onboarding-bank.svg", iconClass: undefined },
] as const;

export const TEAM_SIZE_OPTIONS = ["Just me", "2–10 people", "10–25 people", "25–50 people", "50–100 people", "More than 100 people"];

/** Mock: the organization that is being set up. */
export const NEW_ORGANIZATION = { name: "Kharis Developments Ltd", headOffice: "Airport City, Accra" };

export const BRANCH_TYPES = ["Branch office", "Sales office", "Project site", "Warehouse", "Showroom"];

export const TEAM_ROLES = [
  { id: "Admin", can: "Everything, including billing, verification and team" },
  { id: "Manager", can: "Listings, leads, projects and staff in their branch" },
  { id: "Staff", can: "Tasks, messages and records assigned to them" },
  { id: "Viewer", can: "Read-only reports for owners and partners" },
];

export const ORGANIZATION_PLANS: BusinessPlan[] = [
  { id: "pro", name: "Pro", price: "GHS 149", per: "/month", note: "For a small team at one location", features: ["One admin, no staff roles", "Leads and CRM", "Analytics"], action: "Start 14-day Pro trial" },
  { id: "business", name: "Business", price: "GHS 599", per: "/month", note: "For multi-branch teams", badge: "Recommended", features: ["Unlimited branches", "Staff roles and permissions", "Approval workflows", "Audit log"], action: "Start 14-day Business trial" },
  { id: "enterprise", name: "Enterprise", price: "Custom", per: "", note: "For large groups", features: ["Everything in Business", "API and webhooks", "SSO and dedicated manager"], action: "Contact sales" },
];
