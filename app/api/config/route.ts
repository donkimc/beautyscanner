import { isConfigured } from "../../../auth/google";
import { emailConfigured } from "../../../email/send";

// Tells the client which optional features exist (no secrets), so it only asks for consent when needed.
export async function GET() {
  return Response.json(
    { ai: Boolean(process.env.DEEPSEEK_API_KEY), google: isConfigured(), email: emailConfigured() },
    { headers: { "cache-control": "no-store" } },
  );
}
