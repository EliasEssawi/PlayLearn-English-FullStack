import { Resend } from "resend";
// Initialize Resend client using API key from environment variables

const resend = new Resend(process.env.RESEND_API_KEY);
// Ensure a required environment variable exists

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}
// Wrap a promise with a timeout to avoid hanging requests

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Resend request timed out after ${ms}ms`)), ms)
    ),
  ]);
}


const FROM = requireEnv("MAIL_FROM");
const APP_URL = requireEnv("APP_URL");

type SendResult = { ok: true; id?: string } | { ok: false; error: string };
// Send welcome email to a newly registered user

export async function sendWelcomeEmail(to: string, fullName?: string): Promise<SendResult> {
  try {
    const subject = "Welcome to our app!";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Welcome${fullName ? `, ${fullName}` : ""} 👋</h2>
        <p>Your account is ready.</p>
        <p><a href="${APP_URL}" target="_blank" rel="noreferrer">Open the app</a></p>
      </div>
    `;
    // Send email with timeout protection

    const result = await withTimeout(
      resend.emails.send({ from: FROM, to, subject, html }),
      8000
    );

    // Resend typically returns { data, error }
    const { data, error } = result as any;

    if (error) return { ok: false, error: `${error.name ?? "error"}: ${error.message ?? String(error)}` };

    const id = data?.id;
    return id ? { ok: true, id } : { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Failed to send welcome email" };
  }
}
// Send password reset email containing a secure reset link


export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<SendResult> {
  try {
    const resetLink = `${APP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

    const subject = "Reset your password";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Password reset request</h2>
        <p>Click this link to reset your password:</p>
        <p><a href="${resetLink}" target="_blank" rel="noreferrer">${resetLink}</a></p>
        <p>If you didn’t request this, please contact us.</p>
      </div>
    `;
    // Send email with timeout protection

    const result = await withTimeout(
      resend.emails.send({ from: FROM, to, subject, html }),
      8000
    );

    const { data, error } = result as any;

    if (error) return { ok: false, error: `${error.name ?? "error"}: ${error.message ?? String(error)}` };
    // Extract email ID if available

    const id = data?.id;
    return id ? { ok: true, id } : { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Failed to send reset email" };
  }
}
