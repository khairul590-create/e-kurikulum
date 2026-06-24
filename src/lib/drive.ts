// Helper pautan Google Drive — ekstrak ID & jana URL embed/preview.

/** ID folder Drive dari pelbagai bentuk pautan. */
export function parseDriveFolderId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/folders\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

/** ID fail Drive dari pelbagai bentuk pautan. */
export function parseDriveFileId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

/** URL embed senarai folder Drive (iframe). Null jika bukan folder. */
export function driveFolderEmbed(url?: string | null): string | null {
  const id = parseDriveFolderId(url);
  return id ? `https://drive.google.com/embeddedfolderview?id=${id}#grid` : null;
}

/** URL preview fail Drive (iframe). Null jika bukan fail Drive. */
export function driveFilePreview(url?: string | null): string | null {
  const id = parseDriveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

/** Adakah URL menunjuk terus ke fail imej? */
export function isImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/i.test(url);
}
