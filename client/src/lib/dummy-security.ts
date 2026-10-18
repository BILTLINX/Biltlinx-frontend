export interface SignedInDevice {
  id: string;
  name: string;
  detail: string;
  /** The device this page is open on; it can't be signed out from here. */
  current?: boolean;
}

export const SIGNED_IN_DEVICES: SignedInDevice[] = [
  { id: "d1", name: "Chrome on Windows · Accra", detail: "Active now", current: true },
  { id: "d2", name: "Biltlinx app · iPhone 15", detail: "2 hours ago · Accra" },
  { id: "d3", name: "Safari on Mac · Kumasi", detail: "12 Oct · Kumasi" },
];
