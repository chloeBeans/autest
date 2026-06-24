/**
 * Thin wrapper around the File System Access API.
 *
 * The directory handles returned here point at the REAL folders on the user's
 * disk. Anything written through them lands in the actual project files, so the
 * user can keep editing those files in their code editor at the same time.
 *
 * `queryPermission` / `requestPermission` are not yet in the DOM lib types, so a
 * few narrow `any` casts are used for those calls only.
 */

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/** Prompt the user to pick a directory (read + write). */
export async function pickDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API not supported in this browser.');
  }
  return (window as any).showDirectoryPicker({ mode: 'readwrite' });
}

/** Ensure we still have readwrite permission, re-prompting if needed. */
export async function ensurePermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  if (!handle) return false;
  const opts = { mode: 'readwrite' };
  const h = handle as any;
  if ((await h.queryPermission(opts)) === 'granted') return true;
  return (await h.requestPermission(opts)) === 'granted';
}

/** Get (or create) a nested subdirectory handle, e.g. "tests/generated". */
export async function getSubDirectory(
  dirHandle: FileSystemDirectoryHandle,
  subPath: string,
  { create = true }: { create?: boolean } = {},
): Promise<FileSystemDirectoryHandle> {
  let current = dirHandle;
  for (const part of subPath.split('/').filter(Boolean)) {
    current = await current.getDirectoryHandle(part, { create });
  }
  return current;
}

/**
 * Write a text file into dirHandle/subPath/fileName. Creates folders as needed.
 * Returns the relative path written.
 */
export async function writeFile(
  dirHandle: FileSystemDirectoryHandle,
  subPath: string,
  fileName: string,
  content: string,
): Promise<string> {
  const granted = await ensurePermission(dirHandle);
  if (!granted) throw new Error('Write permission denied.');

  const targetDir = subPath
    ? await getSubDirectory(dirHandle, subPath)
    : dirHandle;
  const fileHandle = await targetDir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();

  return [subPath, fileName].filter(Boolean).join('/');
}

/** Browser fallback download when no folder is connected. */
export function downloadTextFile(fileName: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
