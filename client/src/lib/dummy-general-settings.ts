export const PROFILE_VISIBILITY = ["Everyone", "Connections only", "Only me"];
export const WHO_CAN_MESSAGE = ["Everyone", "People I follow", "No one"];
export const QUIET_HOURS = ["Off", "10:00 pm – 7:00 am", "9:00 pm – 6:00 am"];
export const LANGUAGES = ["English (Ghana)", "English (UK)"];
export const REGIONS = ["Ghana", "Nigeria", "Kenya"];
export const CURRENCIES = ["GHS (₵)", "USD ($)"];
export const UNITS = ["m², km", "sq ft, mi"];

export const NOTIFICATION_CHANNELS = ["Push", "Email", "SMS"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_TOPICS: { id: string; label: string; channels: Record<NotificationChannel, boolean> }[] = [
  { id: "messages", label: "Messages & enquiries", channels: { Push: true, Email: true, SMS: false } },
  { id: "bookings", label: "Bookings & payments", channels: { Push: true, Email: true, SMS: true } },
  { id: "operations", label: "Property operations", channels: { Push: true, Email: true, SMS: false } },
  { id: "saved", label: "Saved searches & price drops", channels: { Push: true, Email: false, SMS: false } },
  { id: "community", label: "Community & social", channels: { Push: false, Email: false, SMS: false } },
  { id: "offers", label: "Offers from Biltlinx", channels: { Push: false, Email: false, SMS: false } },
];
