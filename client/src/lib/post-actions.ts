import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { shareContent } from "@/lib/share";
import type { PostCardData } from "@/types/post";

export async function sharePost(post: PostCardData) {
  await shareContent({
    title: post.authorName,
    text: post.text ?? post.subLine ?? undefined,
    path: `#post-${post.id}`,
  });
}

export async function copyPostLink(post: PostCardData) {
  const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
  try {
    await navigator.clipboard.writeText(url);
    showSuccessToast("Link copied to clipboard");
  } catch {
    showErrorToast("Couldn't copy the link");
  }
}
