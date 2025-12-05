
// MOCK IMPLEMENTATION
// Bypasses cloud function calls for the No-Build version.

export async function guardSteveRequest(uid: string) {
  // In the standalone/no-build version, limits are either handled client-side
  // or ignored for this specific check to ensure the app functions offline/locally.
  return {
    ok: true,
    tier: "free",
    used: 0,
    limit: 999,
  };
}
