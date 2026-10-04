// Admins are listed in ADMIN_EMAILS (comma-separated). Login already proves the email address.
export function isAdminEmail(email: string | undefined | null, env: Record<string, string | undefined> = process.env): boolean {
  if (!email) return false;
  const list = (env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}
