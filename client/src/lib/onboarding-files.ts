const files = new Map<string, File>();

export function rememberFile(slot: string, file: File) {
  files.set(slot, file);
}

export function recallFile(slot: string) {
  return files.get(slot) ?? null;
}

export function forgetFiles(prefix: string) {
  for (const key of [...files.keys()]) if (key.startsWith(prefix)) files.delete(key);
}
