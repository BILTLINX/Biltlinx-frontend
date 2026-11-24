"use client";

import { CreateListingModal } from "@/components/shared/CreateListingModal";
import { closeListingDialog, useListingDialogTarget } from "@/hooks/useListingDialog";

/** The one create-listing dialog, mounted once for the whole app and opened with `openListingDialog(target)`. */
export function ListingDialogHost() {
  const target = useListingDialogTarget();
  return target ? <CreateListingModal initial={target} onClose={closeListingDialog} /> : null;
}
