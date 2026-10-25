// Generated from the backend Swagger document. Do not edit by hand.

export interface ChangePasswordRequest {
  currentPassword: string | null;
  newPassword: string | null;
  confirmPassword: string | null;
}

export interface CodeRequest {
  code: string | null;
}

export interface ContactChangeRequest {
  currentPassword: string | null;
  newValue: string | null;
}

export interface CreateOrganizationRequest {
  name: string | null;
  email: string | null;
  phone: string | null;
  ownerEmail: string | null;
}

export interface InviteMemberRequest {
  workEmail: string | null;
  personalEmail: string | null;
  roleIds: string[] | null;
}

export interface MemberRolesRequest {
  roleIds: string[] | null;
}

export interface OtpRequest {
  otp: string | null;
}

export interface PasswordAndCodeRequest {
  currentPassword: string | null;
  code: string | null;
}

export interface PasswordAndOptionalCodeRequest {
  currentPassword: string | null;
  code: string | null;
}

export interface PasswordRequest {
  currentPassword: string | null;
}

export interface PrivacySettingRequest {
  category: string | null;
  visibility: string | null;
}

export interface IdentityReasonRequest {
  reason: string | null;
}

export interface RequestCapabilityRequest {
  capability: string | null;
  note: string | null;
}

export interface RoleRequest {
  name: string | null;
  description: string | null;
  actions: string[] | null;
  deniedActions: string[] | null;
}

export interface UpdatePrivacyRequest {
  settings: PrivacySettingRequest[] | null;
}

export interface CompleteMfaLoginCommand {
  challengeToken: string | null;
  code: string | null;
  method: string | null;
}

export interface ForgotPasswordCommand {
  email: string | null;
  phone: string | null;
}

export interface ForgotPasswordResetCommand {
  email: string | null;
  phone: string | null;
  otp: string | null;
  newPassword: string | null;
  confirmPassword: string | null;
}

export interface LoginCommand {
  email: string | null;
  phone: string | null;
  password: string | null;
  rememberMe: boolean;
}

export interface RegisterUserCommand {
  username: string | null;
  primaryContact: string | null;
  email: string | null;
  password: string | null;
}

export interface ResendOtpCommand {
  email: string | null;
}

export interface SendMfaLoginOtpCommand {
  challengeToken: string | null;
  channel: string | null;
}

export interface VerifyAccountCommand {
  email: string | null;
  otp: string | null;
}

export interface AuditEntryDto {
  id: string;
  action: string | null;
  actorUserId: string | null;
  actorName: string | null;
  subjectUserId: string | null;
  subjectName: string | null;
  organizationId: string | null;
  detail: string | null;
  ipAddress: string | null;
  occurredAt: string;
}

export interface CapabilityDto {
  id: string;
  capability: string | null;
  status: string | null;
  note: string | null;
  reviewReason: string | null;
  requestedAt: string;
  reviewedAt: string | null;
}

export interface CapabilityRequestDto {
  id: string;
  userId: string;
  username: string | null;
  email: string | null;
  capability: string | null;
  status: string | null;
  note: string | null;
  reviewReason: string | null;
  requestedAt: string;
  reviewedAt: string | null;
}

export interface CurrentUserAccountDto {
  id: string;
  email: string | null;
  status: string | null;
  createdAt: string;
  organization: CurrentUserOrganizationDto;
}

export interface CurrentUserDto {
  id: string;
  username: string | null;
  primaryContact: string | null;
  otherContact: string | null;
  profilePicUrl: string | null;
  isVerified: boolean;
  status: string | null;
  createdAt: string;
  totpEnabled: boolean;
  recoveryCodesRemaining: number;
  pendingContactChange: PendingContactChangeDto;
  capabilities: CapabilityDto[] | null;
  accounts: CurrentUserAccountDto[] | null;
}

export interface CurrentUserOrganizationDto {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  photo: string | null;
  status: string | null;
}

export interface DeletionImpactDto {
  canDelete: boolean;
  blockers: string[] | null;
  effects: string[] | null;
  gracePeriodDays: number;
}

export interface DeletionScheduledDto {
  deletionScheduledFor: string;
}

export interface InvitationDto {
  accountId: string;
  organizationId: string;
  organizationName: string | null;
  organizationPhoto: string | null;
  workEmail: string | null;
  invitedAt: string;
}

export interface MfaChallengeDto {
  mfaRequired: boolean;
  challengeToken: string | null;
  expiresAt: string;
  methods: string[] | null;
}

export interface OrganizationMemberDto {
  accountId: string;
  userId: string;
  username: string | null;
  workEmail: string | null;
  status: string | null;
  roles: OrganizationRoleSummaryDto[] | null;
  createdAt: string;
}

export interface OrganizationRoleDto {
  id: string;
  name: string | null;
  description: string | null;
  isSystem: boolean;
  actions: string[] | null;
  deniedActions: string[] | null;
}

export interface OrganizationRoleSummaryDto {
  id: string;
  name: string | null;
}

export interface PendingContactChangeDto {
  kind: string | null;
  value: string | null;
  expiresAt: string;
}

export interface PermissionDto {
  action: string | null;
  group: string | null;
  description: string | null;
}

export interface PrivacySettingDto {
  category: string | null;
  visibility: string | null;
  canBePublic: boolean;
}

export interface RecoveryCodesDto {
  recoveryCodes: string[] | null;
}

export interface TotpSetupDto {
  secret: string | null;
  otpAuthUri: string | null;
}

export interface EnquiryRequest {
  listingId: string;
  message: string | null;
  qualification: QualificationInput;
  campaign: string | null;
}

export interface NextActionRequest {
  at: string | null;
  note: string | null;
  snoozeUntil: string | null;
}

export interface NoteRequest {
  text: string | null;
}

export interface StageRequest {
  stage: string | null;
  reason: string | null;
}

export interface BoardDto {
  columns: Record<string, LeadCardDto[]> | null;
  counts: Record<string, number> | null;
  followUpsDue: number;
}

export interface EnquiryResult {
  leadId: string;
  created: boolean;
}

export interface LeadCardDto {
  id: string;
  listingId: string;
  listingName: string | null;
  prospect: LeadsPersonDto;
  stage: string | null;
  source: string | null;
  nextActionAt: string | null;
  nextActionNote: string | null;
  snoozedUntil: string | null;
  followUpDue: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface LeadDto {
  id: string;
  listingId: string;
  listingName: string | null;
  prospect: LeadsPersonDto;
  source: string | null;
  stage: string | null;
  message: string | null;
  campaign: string | null;
  priceAtEnquiry: PriceSnapshotDto;
  qualification: QualificationInput;
  nextActionAt: string | null;
  nextActionNote: string | null;
  snoozedUntil: string | null;
  closedReason: string | null;
  createdAt: string;
  updatedAt: string | null;
  notes: NoteDto[] | null;
  timeline: TimelineDto[] | null;
}

export interface MyLeadDto {
  id: string;
  listingId: string;
  listingName: string | null;
  status: string | null;
  stage: string | null;
  message: string | null;
  priceAtEnquiry: PriceSnapshotDto;
  qualification: QualificationInput;
  createdAt: string;
  timeline: TimelineDto[] | null;
}

export interface NoteDto {
  id: string;
  author: string;
  text: string | null;
  at: string;
}

export interface LeadsPersonDto {
  accountId: string;
  username: string | null;
  profilePicUrl: string | null;
  isVerified: boolean;
}

export interface PriceSnapshotDto {
  price: number;
  currency: string | null;
  period: string | null;
  listingType: string | null;
}

export interface QualificationInput {
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string | null;
  moveInDate: string | null;
  occupants: number | null;
  purpose: string | null;
  financing: string | null;
  leaseTermMonths: number | null;
  powerKva: number | null;
  landUse: string | null;
}

export interface TimelineDto {
  kind: string | null;
  text: string | null;
  at: string;
}

export interface AddDocumentBody {
  kind: string | null;
  path: string | null;
  contentType: string | null;
  name: string | null;
}

export interface AssignBody {
  assigneeAccountId: string | null;
}

export interface BulkBody {
  ids: string[] | null;
  action: string | null;
  outcome: string | null;
}

export interface CloseBody {
  outcome: string | null;
}

export interface ConfirmViewingBody {
  useAlternative: boolean;
}

export interface CreateListingRequest {
  name: string | null;
  description: string | null;
  price: number;
  currency: string | null;
  listingType: string | null;
  media: ListingsMediaRequest[] | null;
  pricePeriod: string | null;
  addressVisibility: string | null;
  deposit: number | null;
  serviceCharge: number | null;
  serviceChargePeriod: string | null;
  isNegotiable: boolean | null;
  paymentPlanNote: string | null;
  leaseTermMonths: number | null;
}

export interface DocumentUploadBody {
  kind: string | null;
  contentType: string | null;
  sizeBytes: number;
}

export interface ListingsMediaRequest {
  path: string | null;
  contentType: string | null;
  name: string | null;
}

export interface ListingsNoteBody {
  note: string | null;
}

export interface PostPropertyRequest {
  name: string | null;
  description: string | null;
  price: number;
  currency: string | null;
  address: string | null;
  city: string | null;
  listingType: string | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  media: ListingsMediaRequest[] | null;
  pricePeriod: string | null;
  addressVisibility: string | null;
  latitude: number | null;
  longitude: number | null;
  floorAreaSqm: number | null;
  landSizeSqm: number | null;
  useClass: string | null;
  powerCapacityKva: number | null;
  deposit: number | null;
  serviceCharge: number | null;
  serviceChargePeriod: string | null;
  isNegotiable: boolean | null;
  paymentPlanNote: string | null;
  leaseTermMonths: number | null;
  authorityRole: string | null;
}

export interface ProposeViewingBody {
  at: string;
  note: string | null;
}

export interface SaveDraftBody {
  step: number | null;
  data: unknown | null;
}

export interface UpdatePropertyRequest {
  name: string | null;
  description: string | null;
  price: number;
  currency: string | null;
  address: string | null;
  city: string | null;
  listingType: string | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  availability: string | null;
  media: ListingsMediaRequest[] | null;
  pricePeriod: string | null;
  addressVisibility: string | null;
  latitude: number | null;
  longitude: number | null;
  floorAreaSqm: number | null;
  landSizeSqm: number | null;
  useClass: string | null;
  powerCapacityKva: number | null;
  deposit: number | null;
  serviceCharge: number | null;
  serviceChargePeriod: string | null;
  isNegotiable: boolean | null;
  paymentPlanNote: string | null;
  leaseTermMonths: number | null;
  confirmMaterialChange: boolean;
}

export interface ViewingRequestBody {
  preferredAt: string;
  alternativeAt: string | null;
  message: string | null;
}

export interface BulkResultDto {
  id: string;
  ok: boolean;
  error: string | null;
}

export interface DocumentUploadTicketDto {
  path: string | null;
  token: string | null;
  uploadUrl: string | null;
  publicUrl: string | null;
  bucket: string | null;
}

export interface DocumentUrlDto {
  url: string | null;
  expiresInSeconds: number | null;
}

export interface DraftDto {
  id: string;
  step: number;
  payload: unknown | null;
  listingId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DraftSummaryDto {
  id: string;
  step: number;
  name: string | null;
  purpose: string | null;
  city: string | null;
  listingId: string | null;
  updatedAt: string;
}

export interface ImpactDto {
  action: string | null;
  activeViewings: number;
  effects: string[] | null;
}

export interface ListingChangeDto {
  id: string;
  changedByAccountId: string;
  isMaterial: boolean;
  changes: unknown | null;
  changedAt: string;
}

export interface ListingDocumentDto {
  id: string;
  kind: string | null;
  isPublic: boolean;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number;
  uploadedAt: string;
  url: string | null;
}

export interface OwnerDto {
  id: string;
  username: string | null;
  organizationName: string | null;
  organizationId: string;
  profilePicUrl: string | null;
  isVerified: boolean;
}

export interface PortfolioSummaryDto {
  total: number;
  byStatus: Record<string, number> | null;
  byAvailability: Record<string, number> | null;
  stale: number;
  hiddenByReports: number;
  viewingRequestsWaiting: number;
}

export interface PropertyDto {
  id: string;
  propertyId: string;
  name: string | null;
  description: string | null;
  price: number;
  currency: string | null;
  pricePeriod: string | null;
  deposit: number | null;
  serviceCharge: number | null;
  serviceChargePeriod: string | null;
  isNegotiable: boolean | null;
  paymentPlanNote: string | null;
  leaseTermMonths: number | null;
  address: string | null;
  addressVisibility: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  listingType: string | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floorAreaSqm: number | null;
  landSizeSqm: number | null;
  useClass: string | null;
  powerCapacityKva: number | null;
  status: string | null;
  availability: string | null;
  approvedAt: string | null;
  lastConfirmedAt: string;
  isStale: boolean;
  unavailableReports: number | null;
  owner: OwnerDto;
  media: PropertyMediaDto[] | null;
  documents: ListingDocumentDto[] | null;
  isOwn: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface PropertyMediaDto {
  name: string | null;
  contentType: string | null;
  url: string | null;
}

export interface ReadinessDto {
  ready: boolean;
  canPublishNow: boolean;
  publishNowReason: string | null;
  issues: ReadinessIssueDto[] | null;
}

export interface ReadinessIssueDto {
  severity: string | null;
  category: string | null;
  field: string | null;
  message: string | null;
}

export interface ViewingRequestDto {
  id: string;
  listingId: string;
  listingName: string | null;
  city: string | null;
  status: string | null;
  preferredAt: string;
  alternativeAt: string | null;
  message: string | null;
  scheduledAt: string | null;
  proposedAt: string | null;
  ownerNote: string | null;
  requesterAccountId: string;
  requesterName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ActionDto {
  type: string | null;
  method: string | null;
  route: string | null;
}

export interface MarketplaceFacetsDto {
  kinds: string[] | null;
  units: UnitDto[] | null;
  unitsByKind: Record<string, string[]> | null;
}

export interface OfferDto {
  kind: string | null;
  id: string;
  title: string | null;
  city: string | null;
  price: number;
  currency: string | null;
  unit: string | null;
  priceLabel: string | null;
  category: string | null;
  negotiable: boolean;
  coverUrl: string | null;
  detailRoute: string | null;
  actions: ActionDto[] | null;
  ownerAccountId: string;
  createdAt: string;
}

export interface PriceChangeDto {
  changedAt: string;
  change: string | null;
}

export interface UnitDto {
  unit: string | null;
  label: string | null;
}

export interface ArchiveRequest {
  archived: boolean;
}

export interface AttachmentRequest {
  path: string | null;
  contentType: string | null;
  name: string | null;
}

export interface EditMessageRequest {
  body: string | null;
}

export interface ReportRequest {
  category: string | null;
  note: string | null;
}

export interface ResolveRequest {
  resolution: string | null;
}

export interface SendMessageRequest {
  body: string | null;
  attachments: AttachmentRequest[] | null;
  clientMessageId: string | null;
}

export interface SeqRequest {
  seq: number;
}

export interface StartConversationRequest {
  recipientAccountId: string;
  contextType: string | null;
  contextId: string | null;
  contextTitle: string | null;
  message: string | null;
}

export interface AttachmentDto {
  url: string | null;
  contentType: string | null;
  name: string | null;
}

export interface BlockDto {
  accountId: string;
  name: string | null;
  since: string;
}

export interface CardDto {
  refType: string | null;
  refId: string | null;
  snapshot: unknown | null;
}

export interface ConversationDto {
  id: string;
  contextType: string | null;
  contextId: string | null;
  contextTitle: string | null;
  other: MessagingPersonDto;
  unread: number;
  last: MessageDto;
  lastMessageAt: string;
  archived: boolean;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  seq: number;
  senderAccountId: string | null;
  type: string | null;
  body: string | null;
  deleted: boolean;
  edited: boolean;
  card: CardDto;
  attachments: AttachmentDto[] | null;
  createdAt: string;
  status: string | null;
}

export interface MessagingPersonDto {
  accountId: string;
  name: string | null;
  profilePicUrl: string | null;
  isVerified: boolean;
}

export interface ReportDto {
  id: string;
  reporterAccountId: string;
  reportedAccountId: string | null;
  conversationId: string;
  messageId: string;
  category: string | null;
  note: string | null;
  snapshotBody: string | null;
  contextType: string | null;
  contextId: string | null;
  status: string | null;
  resolution: string | null;
  createdAt: string;
}

export interface WelcomeEmailModel {
  email: string | null;
}

export interface ReconcileRequest {
  note: string | null;
}

export interface AdminPaymentDto {
  payment: PaymentDto;
  payerAccountId: string;
  payerEmail: string | null;
  provider: string | null;
  providerTransactionId: string | null;
  manuallyReconciled: boolean;
  reconciledBy: string | null;
  reconciliationNote: string | null;
  audit: PaymentAuditDto[] | null;
}

export interface PaymentAuditDto {
  action: string | null;
  from: string | null;
  to: string | null;
  actor: string | null;
  detail: string | null;
  at: string;
}

export interface PaymentDto {
  id: string;
  reference: string | null;
  purpose: string | null;
  subjectId: string;
  description: string | null;
  amount: number;
  currency: string | null;
  status: string | null;
  documentType: string | null;
  receiptNumber: string | null;
  lines: PaymentLineDto[] | null;
  authorizationUrl: string | null;
  paidAt: string | null;
  refunded: number;
  failureReason: string | null;
  createdAt: string;
}

export interface PaymentLineDto {
  label: string | null;
  amount: number;
  kind: string | null;
}

export interface ArtisanRequest {
  trade: string | null;
  skills: string[] | null;
  pricing: string | null;
  isBusiness: boolean | null;
  crewSize: number | null;
  yearsExperience: number | null;
}

export interface BookingRequestBody {
  date: string;
  notes: string | null;
  acceptTerms: boolean;
}

export interface InspectionBody {
  at: string;
  fee: number | null;
  currency: string | null;
  notes: string | null;
}

export interface ServicesMediaRequest {
  path: string | null;
  contentType: string | null;
  name: string | null;
  stage: string | null;
  caption: string | null;
}

export interface ServicesNoteBody {
  note: string | null;
}

export interface OfferingRequest {
  title: string | null;
  description: string | null;
  category: string | null;
  mode: string | null;
  price: number | null;
  currency: string | null;
  priceUnit: string | null;
  serviceAreas: string[] | null;
  maxBookingsPerDay: number | null;
  terms: string | null;
  media: ServicesMediaRequest[] | null;
}

export interface PortfolioRequest {
  title: string | null;
  description: string | null;
  completedYear: number | null;
  media: ServicesMediaRequest[] | null;
}

export interface ProfessionalRequest {
  profession: string | null;
  specialisations: string[] | null;
  registrationBody: string | null;
  registrationNumber: string | null;
  firmName: string | null;
  yearsExperience: number | null;
}

export interface QuoteBody {
  labour: number | null;
  materials: number | null;
  fees: number | null;
  durationDays: number | null;
  exclusions: string | null;
  depositPercent: number | null;
  validDays: number | null;
  notes: string | null;
  isChangeOrder: boolean | null;
}

export interface QuoteRequestBody {
  title: string | null;
  description: string | null;
  category: string | null;
  city: string | null;
  preferredStart: string | null;
  budget: number | null;
  currency: string | null;
  offeringId: string | null;
  needsInspection: boolean | null;
  providerIds: string[] | null;
}

export interface SaveProviderRequest {
  displayName: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  serviceAreas: string[] | null;
  serviceRadiusKm: number | null;
  extraCategories: string[] | null;
  urgentAvailable: boolean | null;
  publish: boolean | null;
  professional: ProfessionalRequest;
  artisan: ArtisanRequest;
}

export interface AvailabilityDayDto {
  date: string;
  taken: number;
  capacity: number;
  available: boolean;
}

export interface ArtisanDto {
  trade: string | null;
  skills: string[] | null;
  pricing: string | null;
  isBusiness: boolean;
  crewSize: number | null;
  yearsExperience: number | null;
}

export interface ServicesBookingDto {
  id: string;
  offeringId: string;
  offeringTitle: string | null;
  date: string;
  status: string | null;
  notes: string | null;
  providerNote: string | null;
  createdAt: string;
  requester: ProviderOwnerDto;
  provider: ProviderCardDto;
}

export interface InspectionDto {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string | null;
  proposedAt: string;
  fee: number | null;
  currency: string | null;
  notes: string | null;
  status: string | null;
}

export interface OfferingDto {
  id: string;
  providerId: string;
  title: string | null;
  description: string | null;
  category: string | null;
  mode: string | null;
  status: string | null;
  price: number | null;
  currency: string | null;
  priceUnit: string | null;
  priceLabel: string | null;
  primaryAction: string | null;
  serviceAreas: string[] | null;
  maxBookingsPerDay: number | null;
  terms: string | null;
  media: ServiceMediaDto[] | null;
  provider: ProviderCardDto;
  createdAt: string;
}

export interface PortfolioItemDto {
  id: string;
  title: string | null;
  description: string | null;
  completedYear: number | null;
  media: PortfolioMediaDto[] | null;
}

export interface PortfolioMediaDto {
  url: string | null;
  contentType: string | null;
  stage: string | null;
  caption: string | null;
}

export interface ProfessionalDto {
  profession: string | null;
  specialisations: string[] | null;
  registrationBody: string | null;
  registrationNumber: string | null;
  firmName: string | null;
  yearsExperience: number | null;
}

export interface ProviderCardDto {
  id: string;
  displayName: string | null;
  headline: string | null;
  city: string | null;
  categories: string[] | null;
  urgentAvailable: boolean;
  credentialVerified: boolean;
  credentialWarning: string | null;
  isPublished: boolean;
  owner: ProviderOwnerDto;
}

export interface ProviderDto {
  id: string;
  displayName: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  serviceAreas: string[] | null;
  serviceRadiusKm: number | null;
  categories: string[] | null;
  urgentAvailable: boolean;
  credentialVerified: boolean;
  credentialWarning: string | null;
  isPublished: boolean;
  professional: ProfessionalDto;
  artisan: ArtisanDto;
  owner: ProviderOwnerDto;
  portfolio: PortfolioItemDto[] | null;
  publishedServices: number;
}

export interface ProviderOwnerDto {
  accountId: string;
  username: string | null;
  profilePicUrl: string | null;
  isVerified: boolean;
}

export interface QuoteDto {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string | null;
  credentialVerified: boolean;
  version: number;
  isChangeOrder: boolean;
  parentQuoteId: string | null;
  labour: number;
  materials: number;
  fees: number;
  total: number;
  currency: string | null;
  durationDays: number | null;
  exclusions: string | null;
  depositPercent: number | null;
  validUntil: string | null;
  expired: boolean;
  notes: string | null;
  status: string | null;
  createdAt: string;
}

export interface QuoteRequestDto {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  city: string | null;
  preferredStart: string | null;
  budget: number | null;
  currency: string | null;
  offeringId: string | null;
  requiresInspection: boolean;
  status: string | null;
  acceptedQuoteId: string | null;
  createdAt: string;
  requester: ProviderOwnerDto;
  invitedProviderIds: string[] | null;
  quoteCount: number;
  quotes: QuoteDto[] | null;
  inspections: InspectionDto[] | null;
}

export interface ServiceMediaDto {
  url: string | null;
  contentType: string | null;
}

export interface TaxonomyDto {
  professions: string[] | null;
  trades: string[] | null;
  safetyCritical: string[] | null;
  safetyWarning: string | null;
}

export interface TradeSuggestion {
  trade: string | null;
  score: number;
  safetyCritical: boolean;
  warning: string | null;
}

export interface AddCommentRequest {
  body: string | null;
  parentCommentId: string | null;
}

export interface CreatePostRequest {
  kind: string | null;
  title: string | null;
  description: string | null;
  metaData: unknown | null;
  media: SocialMediaRequest[] | null;
  pollOptions: string[] | null;
  pollDurationHours: number | null;
}

export interface CreateStoryRequest {
  media: SocialMediaRequest;
  caption: string | null;
}

export interface SocialMediaRequest {
  path: string | null;
  contentType: string | null;
  name: string | null;
}

export interface UploadUrlRequest {
  contentType: string | null;
  sizeBytes: number;
}

export interface VotePollRequest {
  optionId: string;
}

export interface AuthorDto {
  id: string;
  username: string | null;
  organizationName: string | null;
  organizationId: string;
  profilePicUrl: string | null;
  isVerified: boolean;
  isFollowedByMe: boolean;
}

export interface CommentDto {
  id: string;
  postId: string;
  parentCommentId: string | null;
  author: AuthorDto;
  body: string | null;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
  isOwn: boolean;
  createdAt: string;
}

export interface MediaDto {
  name: string | null;
  contentType: string | null;
  url: string | null;
  isVideo: boolean;
}

export interface NewPostCountDto {
  count: number;
}

export interface PollDto {
  options: PollOptionDto[] | null;
  totalVotes: number;
  myVoteOptionId: string | null;
  closesAt: string | null;
  isClosed: boolean;
}

export interface PollOptionDto {
  id: string;
  label: string | null;
  voteCount: number;
}

export interface PostDto {
  id: string;
  kind: string | null;
  author: AuthorDto;
  title: string | null;
  description: string | null;
  hashtags: string[] | null;
  metaData: unknown | null;
  media: MediaDto[] | null;
  poll: PollDto;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isOwn: boolean;
  createdAt: string;
}

export interface StoryGroupDto {
  author: AuthorDto;
  isOwn: boolean;
  hasUnseen: boolean;
  stories: StoryItemDto[] | null;
}

export interface StoryItemDto {
  id: string;
  media: MediaDto;
  caption: string | null;
  seen: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface SuggestedAccountDto {
  account: AuthorDto;
  bio: string | null;
  followerCount: number;
}

export interface TrendingHashtagDto {
  tag: string | null;
  postCount: number;
}

export interface SocialUploadTicketDto {
  path: string | null;
  token: string | null;
  uploadUrl: string | null;
  publicUrl: string | null;
  bucket: string | null;
}

export interface BlockRequest {
  from: string;
  to: string;
  units: number | null;
  reason: string | null;
}

export interface CheckoutRequest {
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  specialRequests: string | null;
  acceptTerms: boolean;
}

export interface ExtendRequest {
  extraNights: number;
}

export interface HoldRequest {
  ratePlanId: string;
  checkIn: string;
  checkOut: string;
  guests: number | null;
  rooms: number | null;
  academicPeriodId: string | null;
}

export interface ModifyRequest {
  checkIn: string;
  checkOut: string;
  guests: number | null;
  rooms: number | null;
}

export interface StayReasonRequest {
  reason: string | null;
}

export interface AcademicPeriodDto {
  id: string;
  name: string | null;
  startsOn: string;
  endsOn: string;
}

export interface AcademicPeriodInput {
  name: string | null;
  startsOn: string;
  endsOn: string;
}

export interface StayBookingDto {
  id: string;
  reference: string | null;
  stayId: string;
  propertyName: string | null;
  roomTypeId: string;
  roomName: string | null;
  ratePlanId: string;
  ratePlanName: string | null;
  parentBookingId: string | null;
  checkIn: string;
  checkOut: string;
  units: number;
  guests: number;
  status: string | null;
  holdExpiresAt: string | null;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  specialRequests: string | null;
  price: PriceBreakdownDto;
  paymentReference: string | null;
  paid: number;
  refunded: number;
  cancellationTerms: string | null;
  address: string | null;
  checkInAt: string;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  cancelledBy: string | null;
  depositReleased: boolean;
  operator: OperatorDto;
  guestUsername: string | null;
}

export interface BookingEventDto {
  from: string | null;
  to: string | null;
  actor: string | null;
  note: string | null;
  at: string;
}

export interface CancellationPreviewDto {
  refundPercent: number;
  refundAmount: number;
  currency: string | null;
  terms: string | null;
}

export interface CheckoutResultDto {
  booking: StayBookingDto;
  paymentReference: string | null;
  authorizationUrl: string | null;
  paymentStatus: string | null;
}

export interface MediaInput {
  path: string | null;
  contentType: string | null;
  name: string | null;
}

export interface OperatorDto {
  accountId: string;
  name: string | null;
  profilePicUrl: string | null;
  isVerified: boolean;
}

export interface PriceBreakdownDto {
  nights: number;
  units: number;
  currency: string | null;
  nightly: number;
  subtotal: number;
  discount: number;
  cleaning: number;
  deposit: number;
  tax: number;
  total: number;
  lines: PriceLineDto[] | null;
  cancellationTerms: string | null;
}

export interface PriceLineDto {
  label: string | null;
  amount: number;
  kind: string | null;
}

export interface RatePlanDto {
  id: string;
  name: string | null;
  nightly: number;
  currency: string | null;
  includesBreakfast: boolean;
  refundable: boolean;
  minNights: number;
  maxNights: number | null;
  longStayDiscountPercent: number;
  isActive: boolean;
  quote: PriceBreakdownDto;
}

export interface RoomDto {
  id: string;
  name: string | null;
  description: string | null;
  shape: string | null;
  quantity: number;
  maxGuestsPerUnit: number;
  bedsDescription: string | null;
  isActive: boolean;
  availableUnits: number | null;
  unitsNeeded: number | null;
  bookable: boolean | null;
  unavailableReason: string | null;
  ratePlans: RatePlanDto[] | null;
}

export interface SaveRatePlanInput {
  name: string | null;
  nightly: number;
  includesBreakfast: boolean;
  refundable: boolean;
  minNights: number;
  maxNights: number | null;
  longStayDiscountPercent: number;
}

export interface SaveRoomInput {
  name: string | null;
  description: string | null;
  shape: string | null;
  quantity: number;
  maxGuestsPerUnit: number;
  bedsDescription: string | null;
}

export interface SaveStayInput {
  name: string | null;
  description: string | null;
  type: string | null;
  city: string | null;
  area: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  amenities: string[] | null;
  currency: string | null;
  cleaningFee: number | null;
  taxPercent: number | null;
  securityDeposit: number | null;
  cancellationPolicy: string | null;
  checkInFrom: string | null;
  checkOutBy: string | null;
  houseRules: string | null;
  accessibility: string | null;
  opensOn: string | null;
  media: MediaInput[] | null;
  academicPeriods: AcademicPeriodInput[] | null;
}

export interface StayCardDto {
  id: string;
  name: string | null;
  type: string | null;
  city: string | null;
  area: string | null;
  coverUrl: string | null;
  amenities: string[] | null;
  operator: OperatorDto;
  status: string | null;
  fromNightly: number | null;
  currency: string | null;
  totalForStay: number | null;
  nights: number | null;
  available: boolean | null;
  shapes: string[] | null;
  priceLabel: string | null;
}

export interface StayDetailDto {
  id: string;
  name: string | null;
  description: string | null;
  type: string | null;
  city: string | null;
  area: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  amenities: string[] | null;
  currency: string | null;
  cleaningFee: number;
  taxPercent: number;
  securityDeposit: number;
  cancellationPolicy: string | null;
  cancellationTerms: string | null;
  checkInFrom: string | null;
  checkOutBy: string | null;
  houseRules: string | null;
  accessibility: string | null;
  opensOn: string | null;
  isOpen: boolean;
  status: string | null;
  photos: string[] | null;
  operator: OperatorDto;
  academicPeriods: AcademicPeriodDto[] | null;
  rooms: RoomDto[] | null;
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
}

export interface StayQuoteDto {
  available: boolean;
  unitsNeeded: number;
  price: PriceBreakdownDto;
}

export interface ApproveRequest {
  note: string | null;
  expiresAt: string | null;
}

export interface EvidenceRequest {
  path: string | null;
  contentType: string | null;
  name: string | null;
  classification: string | null;
}

export interface VerificationReasonRequest {
  reason: string | null;
}

export interface RespondRequest {
  message: string | null;
  evidence: EvidenceRequest[] | null;
}

export interface SubmitRequest {
  type: string | null;
  subjectId: string | null;
  title: string | null;
  declarationAccepted: boolean;
  evidence: EvidenceRequest[] | null;
}

export interface UploadRequest {
  contentType: string | null;
  sizeBytes: number;
}

export interface EvidenceDto {
  id: string;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number;
  classification: string | null;
  uploadedAt: string;
}

export interface EvidenceUrlDto {
  url: string | null;
  expiresInSeconds: number;
}

export interface ReviewDetailDto {
  id: string;
  accountId: string;
  userId: string;
  username: string | null;
  organizationName: string | null;
  verification: VerificationDto;
}

export interface ReviewQueueItemDto {
  id: string;
  type: string | null;
  status: string | null;
  title: string | null;
  accountId: string;
  username: string | null;
  organizationName: string | null;
  submittedAt: string;
  attempts: number;
}

export interface StatusChangeDto {
  from: string | null;
  to: string | null;
  note: string | null;
  at: string;
}

export interface VerificationUploadTicketDto {
  path: string | null;
  token: string | null;
  uploadUrl: string | null;
  bucket: string | null;
}

export interface VerificationDto {
  id: string;
  type: string | null;
  subjectId: string | null;
  status: string | null;
  title: string | null;
  expiresAt: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  attempts: number;
  evidence: EvidenceDto[] | null;
  history: StatusChangeDto[] | null;
}

export interface AppInfo {
  name: string | null;
  version: string | null;
}

export interface ActionNeededItem {
  module: string | null;
  type: string | null;
  title: string | null;
  description: string | null;
  link: string | null;
  priority: number;
}

export interface PagedOfAuditEntryDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: AuditEntryDto[] | null;
  empty: boolean;
}

export interface PagedOfCapabilityRequestDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: CapabilityRequestDto[] | null;
  empty: boolean;
}

export interface PagedOfLeadCardDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: LeadCardDto[] | null;
  empty: boolean;
}

export interface PagedOfMyLeadDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: MyLeadDto[] | null;
  empty: boolean;
}

export interface PagedOfPropertyDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: PropertyDto[] | null;
  empty: boolean;
}

export interface PagedOfOfferDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: OfferDto[] | null;
  empty: boolean;
}

export interface PagedOfConversationDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: ConversationDto[] | null;
  empty: boolean;
}

export interface PagedOfReportDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: ReportDto[] | null;
  empty: boolean;
}

export interface PagedOfPaymentDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: PaymentDto[] | null;
  empty: boolean;
}

export interface PagedOfOfferingDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: OfferingDto[] | null;
  empty: boolean;
}

export interface PagedOfProviderCardDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: ProviderCardDto[] | null;
  empty: boolean;
}

export interface PagedOfAuthorDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: AuthorDto[] | null;
  empty: boolean;
}

export interface PagedOfCommentDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: CommentDto[] | null;
  empty: boolean;
}

export interface PagedOfPostDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: PostDto[] | null;
  empty: boolean;
}

export interface PagedOfSuggestedAccountDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: SuggestedAccountDto[] | null;
  empty: boolean;
}

export interface PagedOfBookingDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: StayBookingDto[] | null;
  empty: boolean;
}

export interface PagedOfStayCardDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: StayCardDto[] | null;
  empty: boolean;
}

export interface PagedOfReviewQueueItemDto {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  items: ReviewQueueItemDto[] | null;
  empty: boolean;
}

export interface ModuleInfo {
  name: string | null;
  policies: string[] | null;
}

export interface ProblemDetails {
  type: string | null;
  title: string | null;
  status: number | null;
  detail: string | null;
  instance: string | null;
}
