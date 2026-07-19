/** Thin wrapper avoids circular imports between syncService and game stores in release builds. */
export async function pushIfSignedIn(): Promise<void> {
  const { pushSnapshotIfSignedIn } = await import('./syncService');
  await pushSnapshotIfSignedIn();
}
