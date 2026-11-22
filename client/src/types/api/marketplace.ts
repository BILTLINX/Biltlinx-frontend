export type MarketCategory = "Materials" | "Equipment" | "Land";

export type MarketListingStatus = "PendingReview" | "Live" | "Rejected" | "Paused" | "Removed";

export type MarketOrderStatus = "Requested" | "Accepted" | "Paid" | "Dispatched" | "Completed" | "Declined" | "Cancelled" | "Disputed" | "Refunded";

export type MarketOrderAction = "Accept" | "Decline" | "Cancel" | "Pay" | "Dispatch" | "CancelAndRefund" | "ConfirmDelivery" | "Dispute";

export interface MarketOffer {
  id: string;
  category: MarketCategory;
  title: string;
  location: string;
  price: number;
  currency: string;
  unit: string;
  coverUrl: string | null;
  deliveryAvailable: boolean;
  stock: number | null;
  detailRoute: string;
  sellerAccountId: string;
  createdAt: string;
}

export interface MyMarketListing {
  offer: MarketOffer;
  status: MarketListingStatus;
  rejectionReason: string | null;
}

export interface StaffMarketListing {
  offer: MarketOffer;
  status: MarketListingStatus;
  seller: string;
  description: string;
  photos: string[];
  reviewedAt: string | null;
}

export interface MarketBulk {
  minQuantity: number;
  price: number;
}

export interface MarketSeller {
  accountId: string;
  name: string;
  avatarUrl: string | null;
  verified: boolean;
  completedOrders: number;
  memberSince: string;
}

export interface MarketListing {
  id: string;
  category: MarketCategory;
  title: string;
  description: string;
  location: string;
  price: number;
  currency: string;
  unit: string;
  photos: string[];
  stock: number | null;
  minOrder: number | null;
  deliveryAvailable: boolean;
  deliveryFee: number | null;
  bulk: MarketBulk | null;
  status: MarketListingStatus;
  rejectionReason: string | null;
  seller: MarketSeller;
  isMine: boolean;
  createdAt: string;
}

export interface MarketFacets {
  categories: { category: MarketCategory; label: string; units: { unit: string; label: string }[] }[];
}

export interface MarketListingInput {
  category: MarketCategory;
  title: string;
  description: string;
  price: number;
  unit: string;
  location: string;
  stock: number | null;
  minOrder: number | null;
  deliveryAvailable: boolean;
  deliveryFee: number | null;
  bulkMinQuantity: number | null;
  bulkPrice: number | null;
  photos?: string[];
}

export interface MarketParty {
  accountId: string;
  name: string;
  avatarUrl: string | null;
  verified: boolean;
}

export interface MarketOrder {
  id: string;
  listingId: string;
  title: string;
  category: string;
  unit: string;
  coverUrl: string | null;
  quantity: number;
  unitPrice: number;
  deliveryFee: number;
  fee: number;
  total: number;
  currency: string;
  wantsDelivery: boolean;
  deliverTo: string | null;
  note: string | null;
  status: MarketOrderStatus;
  escrow: "None" | "Held" | "Released" | "Refunded";
  payout: "None" | "Due" | "Paid";
  reason: string | null;
  buyer: MarketParty;
  seller: MarketParty;
  role: "Buyer" | "Seller";
  actions: MarketOrderAction[];
  createdAt: string;
  paidAt: string | null;
  dispatchedAt: string | null;
  completedAt: string | null;
  autoConfirmAt: string | null;
}

export interface MarketStaffOrder {
  order: MarketOrder;
  sellerReceives: number;
  payoutNote: string | null;
  payoutPaidAt: string | null;
}

export interface PlaceMarketOrderInput {
  listingId: string;
  quantity: number;
  wantsDelivery: boolean;
  deliverTo: string | null;
  note: string | null;
}

export interface MarketOrderPayment {
  paymentId: string;
  reference: string;
  authorizationUrl: string | null;
}
