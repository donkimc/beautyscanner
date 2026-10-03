// Sends transactional email through Resend's HTTP API. Requires RESEND_API_KEY and EMAIL_FROM
// (a sender on a domain verified in Resend, e.g. "BeautyScanner <login@yourdomain.com>").

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export async function sendEmail(msg: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  if (!emailConfigured()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
