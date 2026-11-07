/**
 * ELYORA educational port: deliberately fail-closed until a real official,
 * version-pinned ELYORA contract, transport and connected testing exist.
 * Do NOT create local learning/mastery/progression implementations here.
 */
export async function invokeElyoraPractice(_authorizedRequest) {
  const error = new Error("ELYORA_OFFICIAL_CONTRACT_NOT_CONNECTED");
  error.code = "BLOCKED_NOT_CONNECTED";
  throw error;
}
