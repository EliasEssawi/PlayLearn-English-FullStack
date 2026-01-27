import nodemailer from "nodemailer";
import dns from "node:dns";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// Helps in some hosting environments (IPv6 issues → timeouts)
dns.setDefaultResultOrder("ipv4first");

const FROM = requireEnv("MAIL_FROM");              // "PlayLearn Service <playlearnservice@gmail.com>"
const APP_URL = requireEnv("APP_URL");

const GMAIL_USER = requireEnv("GMAIL_USER");       // playlearnservice@gmail.com
const GMAIL_APP_PASSWORD = requireEnv("GMAIL_APP_PASSWORD");

type SendResult = { ok: true; id?: string } | { ok: false; error: string };

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  requireTLS: true,
  tls: { servername: "smtp.gmail.com" },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000,
});

// Optional but VERY useful: see in Render logs if SMTP is reachable
transporter.verify()
  .then(() => console.log("✅ Gmail SMTP ready"))
  .catch((e) => console.error("❌ Gmail SMTP verify failed:", e?.message ?? e));

async function sendMail(to: string, subject: string, html: string): Promise<SendResult> {
  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    return { ok: true, id: info.messageId };
  } catch (err: any) {
    // Log full error on server so you can debug
    console.error("❌ sendMail failed:", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
      command: err?.command,
    });
    return { ok: false, error: err?.message ?? "Failed to send email" };
  }
}

// ✅ SAME NAME
export async function sendWelcomeEmail(to: string, fullName?: string): Promise<SendResult> {
  const subject = "Welcome to our app!";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>Welcome${fullName ? `, ${fullName}` : ""} 👋</h2>
      <p>Your account is ready.</p>
      <p><a href="${APP_URL}" target="_blank" rel="noreferrer">Open the app</a></p>
    </div>
  `;
  return sendMail(to, subject, html);
}

// ✅ SAME NAME + SAME PARAMS
// IMPORTANT: your frontend uses CODE flow.
// So we email the "resetToken" as the code.
// (no function rename, no signature change)
export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<SendResult> {
  const subject = "Reset your password";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>Password reset code</h2>
      <p>Use this code to reset your password:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 12px 0;">
        ${String(resetToken)}
      </div>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  `;
  return sendMail(to, subject, html);
  
}
