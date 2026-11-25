# Roles and permissions: who can do what

**For:** the backend team. **From:** the frontend (`client/`).
**Purpose:** a personal account must not be able to post a property, a stay or a service. Those belong to
the roles that run them. This document lists every role and every action that creates something, and says
which roles may do it, so the backend can enforce it on the server. The frontend can only hide buttons;
only the server can actually stop a request.

> **Status of this document.** It describes what the frontend expects and needs. It is not a record of what
> the backend does today. I could not check the backend while writing it. Where the code gave evidence of
> current behaviour, it is marked **(seen in the frontend)**. Everything else is a requirement to confirm.
> Items that need a product decision are in [Open decisions](#open-decisions).

> **Naming.** Role names below are the capability names the frontend already sends and receives on
> `GET/POST /capabilities` and in `capabilities[]` on the current user. They are not the older role names
> (`buyer`, `estate_manager`, `hotel_manager`, `artisan`, `admin`) in `api-reference.md`, which no longer
> match what the client uses.

---

## 1. Roles

Everyone who signs up starts as a **Seeker**. It is implicit: no capability row, no approval, always on.
Everything else is a **capability** a user asks for (`POST /capabilities { capability, note }`) and the
platform approves.

| Capability (`capability` value) | Who it is for | Asked for from |
|---|---|---|
| *(Seeker, implicit)* | Everyone. Find a home or a stay, hire people, buy, post socially. | Sign-up. The "Personal" account type. |
| `LandlordOwner` | Owns property and lists it. | Roles and teams, in settings. |
| `Agent` | Lists and manages property for others (estate agency). | Business onboarding, kind "agency". |
| `PropertyManager` | Manages a portfolio for owners. | Organisation onboarding, kind "management". |
| `Developer` | Lists new developments (projects and units). | Organisation onboarding, kind "developer", or the "Developer role" prompt. |
| `StayOperator` | Runs hotels, guest houses, hostels or short-lets. | Business onboarding, kind "stay". |
| `Professional` | Architects, surveyors, engineers, lawyers and other licensed experts. | Professional onboarding. |
| `Artisan` | Electricians, plumbers, masons and other trades. | Artisan onboarding. |

A user can hold several at once.

**Status.** A capability row has `status`: `Pending`, `Approved` or `Rejected` (with `reviewReason`).
**Only `Approved` grants anything.** `Pending` and `Rejected` must behave exactly like not having the
capability. A role that is withdrawn (`DELETE /capabilities/{capability}`) stops granting at once.

**Staff** (concierge staff, marketplace review staff) are a separate, internal concept and are not
capabilities. They are mentioned only where an endpoint already has a `/staff/` path.

---

## 2. The matrix

`✓` allowed. `—` not allowed (the server should refuse). `own` means: only on something the user created or
owns. Every row also requires the user to be signed in.

### 2a. Open to every signed-in user (including a personal account)

| Action | Endpoint(s) |
|---|---|
| Text, media, poll and article posts | `POST /feed/posts` with `kind` = `Text` or `Poll` |
| **Post a request** (a plain feed post about an issue; not a quote request) | `POST /feed/posts`, today as a `Text` post. See decision 8 |
| Stories | `POST /feed/stories` |
| Like, comment, follow, save, vote | the existing social endpoints |
| Ask a provider for a quote or consultation | `POST /services/quote-requests` |
| Enquire about a listing | `POST /leads` |
| Request, cancel or reschedule a viewing | `POST /properties/{id}/viewings`, `/viewings/{id}/...` |
| Book a service | `POST /services/{id}/bookings` |
| Order from the marketplace, pay, confirm, dispute | `POST /marketplace/orders`, `/marketplace/orders/{id}/pay`, `/confirm`, `/dispute`, `/cancel` |
| Book a stay, reserve a project unit, book a site visit | the stay booking, `/projects/{id}/visits`, `/projects/reservations/...` endpoints |
| Ask Biltlinx Concierge for help | `/concierge/requests/...` |
| Ask for a role | `POST /capabilities` |
| Submit identity or document verification | `POST /verification` |
| Message other users | the messaging endpoints |
| Create a community or an event | *(no endpoint yet; both are mocked in the frontend)* |

### 2b. Listings and the posts they become

| Action | Endpoint(s) | Seeker | LandlordOwner | Agent | PropertyManager | Developer | StayOperator | Professional | Artisan |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Create, edit, submit or publish a property listing** (drafts, documents, bulk upload, mark available) | `/listing-drafts*`, `POST/PUT/DELETE /properties`, `/properties/bulk`, `/properties/{id}/documents*`, `/properties/{id}/confirm-availability` | — | ✓ | ✓ | ✓ | ✓ | — | — | — |
| **Post a property to the feed** | `POST /properties/{id}/post`, or `POST /feed/posts` with `kind` = `Property` | — | own | own | own | own | — | — | — |
| **Create, edit or publish a stay**, its rooms, rates and availability blocks | `/stay/operator/properties/**` | — | — | — | — | — | ✓ | — | — |
| **Post a stay to the feed** | `POST /feed/posts` with `kind` = `Stay` | — | — | — | — | — | own | — | — |
| **Create, edit, publish or pause a service** (offering) | `POST/PUT /services`, offering actions | — | — | — | — | — | — | ✓ | ✓ |
| **Edit the provider profile, add portfolio items, publish or unpublish it** | `/services/providers/me*` | — | — | — | — | — | — | ✓ | ✓ |
| **Post a service to the feed** | `POST /feed/posts` with `kind` = `Service` | — | — | — | — | — | — | own | own |
| **Send a quote, propose a site inspection, handle service bookings** (provider side) | `/services/quote-requests/{id}/quotes`, `/services/quote-requests/{id}/inspections`, `/services/bookings/{id}/...`, `/services/inspections/{id}/...` | — | — | — | — | — | — | ✓ | ✓ |
| **Create or manage a development**: units, milestones, team, site updates, publish, pause, handle reservations and visits | `/projects` (POST/PUT/DELETE), `/projects/{id}/units`, `/milestones`, `/team`, `/updates`, `/publish`, `/pause`, `/projects/reservations/{id}/release`, `/projects/visits/{id}/...` | — | — | — | — | ✓ | — | — | — |
| **Create an organisation**, add branches, invite or remove members, set their roles | `POST /organizations`, `/organizations/branches`, `/organizations/members*` | — | — | ✓ | ✓ | ✓ | ✓ | — | — |
| **Work the lead pipeline** (stage, notes, next action, reopen) | `/leads/{id}/stage`, `/notes`, `/next-action`, `/reopen` | — | own | own | own | own | own | own | own |
| **List on the marketplace** | `POST/PUT/DELETE /marketplace/listings`, `/pause`, `/resume` | **see decision 1** | | | | | | | |
| **Accept, decline or dispatch a marketplace order** | `/marketplace/orders/{id}/accept`, `/decline`, `/dispatch` | — | the seller of that listing | | | | | | |

"Lead pipeline: own" means the user who owns the listing the lead is on, so the table does not list each
role's own kind of listing separately.

### 2c. Rules that apply across the matrix

1. **Only approved capabilities count**, checked on the server on every request. Do not trust a role the
   client sends, and do not read it from anything the user can edit.
2. **`kind` on `POST /feed/posts` must be checked.** The request body currently carries `kind` as one of
   `Text | Poll | Property | Stay | Service`. A user who is only a Seeker must get `403` for `Property`,
   `Stay` or `Service`. For those three kinds the server must also check that the post points at a listing
   the user owns, and that the listing is in a state that can be posted (approved or live, not paused or
   rejected). Today the property post goes through `POST /properties/{id}/post`, which already ties the post
   to a listing. The other two kinds should do the same.
3. **`metaData` on a `Text` post.** The backend currently refuses it ("Text posts cannot carry metadata."), which is fine and should stay for ordinary posts. The frontend needs one way to tell a "request" post from a plain text post so it can show it differently in the feed. See decision 8.
4. **Ownership, not just role.** Having the role is necessary, not sufficient. Editing, pausing, deleting
   and posting a listing must also check that the listing belongs to the user (or to their organisation,
   see decision 4).
5. **Verification is separate from the role.** Some actions already depend on verification, for example a
   stay needs a verified host to go live, and "publish now" on a property needs a verified owner. Keep
   those checks. Role says who may *create*; verification says what may go *live*.

---

## 3. What the frontend needs back when it is refused

Today the frontend treats **any `403` from `POST /projects` as "you need the Developer role"** and shows a
prompt to request it **(seen in the frontend)**. That is too blunt now that more actions are gated. For
every refusal in this matrix, please return a `403` with a body the client can read, for example:

```json
{
  "code": "capability_required",
  "message": "You need an approved Professional or Artisan role to offer a service.",
  "requiredCapabilities": ["Professional", "Artisan"],
  "yourStatus": "Pending"
}
```

- `requiredCapabilities`: any one of these is enough.
- `yourStatus`: the user's status for the first matching capability (`Pending`, `Rejected`, or omitted if
  they never asked), so the prompt can say "waiting for approval" instead of "request the role".

The exact field names are up to the backend. The frontend only needs a stable code and the list of roles
that would unlock the action.

---

## 4. What the frontend will do once this is agreed

Not built yet. Listed so the backend knows what to expect from the client:

- Read `capabilities` from the current user (already returned) and show the create entries that need a role
  as locked for a personal account. The Create menu already draws a padlock on "Post a Property", "Add
  Stay", "Offer a Service", "Post Project" and "List on Marketplace", but it draws it for **everyone**
  today, whatever their roles. It is not tied to the account yet **(seen in the frontend)**.
- Send a locked entry to "Roles and teams" to ask for the role, instead of opening the form.
- Keep relying on the server for the real decision. Hidden buttons are convenience, not security.

---

## Open decisions

1. **Who may list on the marketplace?** The menu marks it as role-locked, but no capability exists for a
   building supplier or an equipment-hire business. The business onboarding only supports "agency" and
   "stay" today. Options: (a) add a `Supplier` capability and require it, (b) allow any account with at
   least one approved capability, (c) allow any verified account. This document leaves the row open until
   one is chosen.
2. **Is `Developer` allowed to list ordinary properties?** The listing form's "you are the" choices include
   Developer, so the table says yes. If developers should only sell through projects and units, change that
   cell to `—`.
3. **The listing form lets the user pick "Other" as their authority.** If "Other" is accepted, the role gate
   in the property row can be bypassed by declaring it. Recommend the server ignore the declared authority
   and rely on the approved capability alone.
4. **Organisation members.** Members get roles through `PUT /organizations/members/{id}/roles`. Does a
   member who is not personally approved inherit the organisation's capabilities when acting for it? The
   matrix assumes a member acts with the organisation's approved roles, and that ownership then belongs to
   the organisation.
5. **When a role is withdrawn or rejected, what happens to what the user already published?** Suggest:
   listings of that kind are paused, not deleted, and the owner is told why.
6. **Can one account hold both a provider role and a property role at once?** The matrix allows it (roles
   add up). Confirm there is no rule against it.
7. **Rate limits on open actions.** "Post a request" and plain posts are open to everyone, so they are the
   easy place for spam. Worth a per-user limit, though that is outside the role question.
8. **How is a "request" post marked?** The frontend wants request posts to look different in the feed. It first tried `metaData.postType = "request"` on a `Text` post, and the backend rejected it. Options: (a) allow a `postType` of `"request"` in `metaData` on `Text` posts and keep refusing everything else, (b) add a new post `kind` such as `Request`, or (c) the frontend marks it in the post text with a hashtag. (b) is the cleanest, since it also lets the server apply the open-to-everyone rule to it by name. **For now the frontend uses (c):** it adds `#request` to the end of the post text and shows posts containing that tag as requests, hiding the tag. Nothing is needed from the backend for this to work, but it means any text post that contains `#request` will look like a request.
