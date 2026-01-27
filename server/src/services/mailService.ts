import nodemailer from "nodemailer";
import dns from "node:dns";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const APP_URL = requireEnv("APP_URL");
const FROM = requireEnv("MAIL_FROM");

const GMAIL_USER = requireEnv("GMAIL_USER");
const GMAIL_APP_PASSWORD = requireEnv("GMAIL_APP_PASSWORD");

// Optional: prefer IPv4 (helps in some hosting environments)
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },

  // Prevent long hangs
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000,

  // Optional: TLS sanity
  tls: {
    servername: "smtp.gmail.com",
  },
});

// Verify on boot (you will see right away in logs)
transporter.verify()
  .then(() => console.log("✅ SMTP ready (Gmail)"))
  .catch((e) => console.error("❌ SMTP verify failed:", e?.message ?? e));

type SendResult = { ok: true; id?: string } | { ok: false; error: string };

async function sendMail(to: string, subject: string, html: string): Promise<SendResult> {
  try {
    const info = await transporter.sendMail({
      from: FROM,  // e.g. "PlayLearn Service <playlearnservice@gmail.com>"
      to,
      subject,
      html,
    });

    return { ok: true, id: info.messageId };
  } catch (err: any) {
    // Log full error server-side (super important)
    console.error("❌ sendMail failed:", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
      command: err?.command,
      stack: err?.stack,
    });

    return { ok: false, error: err?.message ?? "Failed to send email" };
  }
}

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

// NOTE: This is still link-based. If you use code flow, create sendPasswordResetCodeEmail(code).
export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<SendResult> {
  const resetLink = `${APP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const subject = "Reset your password";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>Password reset request</h2>
      <p>Click this link to reset your password:</p>
      <p><a href="${resetLink}" target="_blank" rel="noreferrer">${resetLink}</a></p>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  `;
  return sendMail(to, subject, html);
}
