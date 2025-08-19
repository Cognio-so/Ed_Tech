import { auth, clerkClient } from "@clerk/nextjs/server";

async function resolveRoleFromUser(userId) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return (
      user.publicMetadata?.role ||
      user.privateMetadata?.role ||
      null
    );
  } catch (e) {
    console.error("Failed to resolve role from Clerk user:", e);
    return null;
  }
}

export async function checkRole(role) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;

  // Prefer session claims (as in Clerk RBAC guide), fallback to user fetch
  const claimRole =
    sessionClaims?.metadata?.role ??
    sessionClaims?.publicMetadata?.role ??
    (await resolveRoleFromUser(userId));

  console.log("RBAC check — expected:", role, "actual:", claimRole);
  return claimRole === role;
}