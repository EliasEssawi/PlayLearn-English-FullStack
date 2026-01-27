import nodemailer from "nodemailer";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const APP_URL = requireEnv("APP_URL");
const FROM = requireEnv("MAIL_FROM");

const GMAIL_USER = requireEnv("GMAIL_USER");
const GMAIL_APP_PASSWORD = requireEnv("GMAIL_APP_PASSWORD");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD, // App Password (NOT your normal Gmail password)
  },
});

type SendResult = { ok: true; id?: string } | { ok: false; error: string };

async function sendMail(to: string, subject: string, html: string): Promise<SendResult> {
  try {
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });
    return { ok: true, id: info.messageId };
  } catch (err: any) {
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
