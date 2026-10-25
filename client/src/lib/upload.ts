import { ApiError } from "@/lib/api";
import { requestUploadUrl } from "@/lib/social-api";
import type { MediaInput } from "@/types/api/social";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export interface UploadOptions {
  allowVideo?: boolean;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

export interface UploadedMedia extends MediaInput {
  publicUrl: string;
}

export function validateMediaFile(file: File, allowVideo = true): string | null {
  const isImage = IMAGE_TYPES.includes(file.type);
  const isVideo = allowVideo && VIDEO_TYPES.includes(file.type);
  if (!isImage && !isVideo) return allowVideo ? "Use a JPEG, PNG, WebP or GIF image, or an MP4, WebM or MOV video." : "Use a JPEG, PNG, WebP or GIF image.";
  if (isImage && file.size > MAX_IMAGE_BYTES) return "Images must be 10 MB or smaller.";
  if (isVideo && file.size > MAX_VIDEO_BYTES) return "Videos must be 100 MB or smaller.";
  return null;
}

function putFile(url: string, file: File, onProgress?: (fraction: number) => void, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new ApiError("The upload failed. Please try again.", xhr.status));
    xhr.onerror = () => reject(new ApiError("Unable to reach the server. Please try again.", 0));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(file);
  });
}

export async function uploadMedia(file: File, options: UploadOptions = {}): Promise<UploadedMedia> {
  const invalid = validateMediaFile(file, options.allowVideo ?? true);
  if (invalid) throw new ApiError(invalid, 400);
  const ticket = await requestUploadUrl({ contentType: file.type, sizeBytes: file.size });
  let attempt = 0;
  for (;;) {
    try {
      await putFile(ticket.uploadUrl, file, options.onProgress, options.signal);
      break;
    } catch (error) {
      attempt += 1;
      if (attempt >= 2 || (error instanceof DOMException && error.name === "AbortError")) throw error;
    }
  }
  return { path: ticket.path, contentType: file.type, name: file.name, publicUrl: ticket.publicUrl };
}

export function uploadAll(files: File[], options: UploadOptions = {}): Promise<UploadedMedia[]> {
  return Promise.all(files.map((file) => uploadMedia(file, options)));
}
