import { Suspense, type ReactNode } from "react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { ListingDialogHost } from "@/components/shared/ListingDialogHost";
import { RequestModalHost } from "@/components/shared/RequestModalHost";
import { MessagingProvider } from "@/context/MessagingContext";
import { SearchProvider } from "@/context/SearchContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RequireAuth>
        <MessagingProvider>
          <SearchProvider>
            {children}
            <RequestModalHost />
            <ListingDialogHost />
          </SearchProvider>
        </MessagingProvider>
      </RequireAuth>
    </Suspense>
  );
}
