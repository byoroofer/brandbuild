import nodemailer from "npm:nodemailer@6.9.16";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

type SupportedEmailActionType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email"
  | "reauthentication";

type HookPayload = {
  email_data: {
    email_action_type: string;
    old_email?: string;
    redirect_to?: string;
    site_url?: string;
    token?: string;
    token_hash?: string;
    token_hash_new?: string;
    token_new?: string;
  };
  user: {
    email?: string;
    id: string;
    new_email?: string;
  };
};

type EmailJob = {
  actionType: SupportedEmailActionType;
  buttonHref: string | null;
  buttonLabel: string | null;
  footerNote: string;
  heading: string;
  otpLabel: string | null;
  otpValue: string | null;
  previewText: string;
  recipient: string;
  subject: string;
};

let transporter:
  | ReturnType<typeof nodemailer.createTransport>
  | null = null;

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

function parseBoolean(value: string | undefined, fallback = false) {
  if (!value) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function getAppName() {
  return Deno.env.get("AUTH_EMAIL_APP_NAME") || "BrandBuild";
}

function getSupportEmail() {
  return Deno.env.get("AUTH_SUPPORT_EMAIL") || "support@brandbuild.online";
}

function getReplyToEmail() {
  return Deno.env.get("AUTH_EMAIL_REPLY_TO") || getSupportEmail();
}

function getFromEmail() {
  return getRequiredEnv("AUTH_EMAIL_FROM_EMAIL");
}

function getFromName() {
  return Deno.env.get("AUTH_EMAIL_FROM_NAME") || getAppName();
}

function getSiteUrl() {
  return new URL(getRequiredEnv("AUTH_EMAIL_SITE_URL"));
}

function getLogoUrl() {
  return (
    Deno.env.get("AUTH_EMAIL_LOGO_URL") ||
    new URL("/brandbuild-logo.svg", getSiteUrl()).toString()
  );
}

function normalizeWebhookSecret(value: string) {
  return value.replace(/^v1,/, "").replace(/^whsec_/, "");
}

function getNextPathFallback(actionType: SupportedEmailActionType) {
  switch (actionType) {
    case "email_change":
      return "/account/security";
    case "invite":
    case "recovery":
      return "/reset-password";
    default:
      return "/dashboard";
  }
}

function getSafePath(pathname: string | null | undefined, fallback: string) {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return fallback;
  }

  return pathname;
}

function extractNextPath(redirectTo: string | undefined, fallback: string) {
  if (!redirectTo) {
    return fallback;
  }

  try {
    const parsed = new URL(redirectTo);

    if (parsed.pathname === "/auth/callback" || parsed.pathname === "/auth/confirm") {
      return getSafePath(parsed.searchParams.get("next"), fallback);
    }

    return getSafePath(`${parsed.pathname}${parsed.search}`, fallback);
  } catch {
    return getSafePath(redirectTo, fallback);
  }
}

function buildConfirmLink(
  actionType: SupportedEmailActionType,
  tokenHash: string | null | undefined,
  redirectTo: string | undefined,
) {
  if (!tokenHash) {
    return null;
  }

  const url = new URL("/auth/confirm", getSiteUrl());
  url.searchParams.set("token_hash", tokenHash);

  if (actionType !== "reauthentication") {
    url.searchParams.set("type", actionType);
  }

  url.searchParams.set("next", extractNextPath(redirectTo, getNextPathFallback(actionType)));

  return url.toString();
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const port = Number(Deno.env.get("AUTH_EMAIL_SMTP_PORT") || "587");

  transporter = nodemailer.createTransport({
    auth: {
      pass: getRequiredEnv("AUTH_EMAIL_SMTP_PASSWORD"),
      user: getRequiredEnv("AUTH_EMAIL_SMTP_USER"),
    },
    host: getRequiredEnv("AUTH_EMAIL_SMTP_HOST"),
    port,
    secure: parseBoolean(Deno.env.get("AUTH_EMAIL_SMTP_SECURE"), port === 465),
  });

  return transporter;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailHtml(job: EmailJob) {
  const appName = escapeHtml(getAppName());
  const supportEmail = escapeHtml(getSupportEmail());
  const footerNote = escapeHtml(job.footerNote);
  const heading = escapeHtml(job.heading);
  const previewText = escapeHtml(job.previewText);
  const buttonLabel = job.buttonLabel ? escapeHtml(job.buttonLabel) : null;
  const buttonHref = job.buttonHref ? escapeHtml(job.buttonHref) : null;
  const otpLabel = job.otpLabel ? escapeHtml(job.otpLabel) : null;
  const otpValue = job.otpValue ? escapeHtml(job.otpValue) : null;
  const logoUrl = escapeHtml(getLogoUrl());

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading}</title>
    <style>
      @media only screen and (max-width: 640px) {
        .email-shell {
          width: 100% !important;
        }

        .email-card {
          border-radius: 22px !important;
          padding: 28px 22px !important;
        }

        .email-heading {
          font-size: 28px !important;
          line-height: 1.12 !important;
        }
      }
    </style>
  </head>
  <body style="margin:0;background:#eef2f7;padding:24px 12px;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td align="center">
          <table class="email-shell" role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:100%;border-collapse:collapse;">
            <tr>
              <td class="email-card" style="padding:40px 40px 32px;border-radius:28px;background:linear-gradient(180deg,#07101b 0%,#0b1420 24%,#ffffff 24%,#ffffff 100%);box-shadow:0 30px 80px rgba(15,23,42,0.18);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding-bottom:28px;">
                      <img src="${logoUrl}" alt="${appName}" width="220" style="display:block;width:220px;max-width:100%;height:auto;border:0;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:18px;">
                      <span style="display:inline-block;border:1px solid rgba(98,215,255,0.18);background:rgba(98,215,255,0.08);color:#0f4c5c;border-radius:999px;padding:7px 12px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">
                        Secure account email
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="email-heading" style="font-size:34px;line-height:1.08;font-weight:700;color:#0f172a;padding-bottom:12px;">
                      ${heading}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:1.7;color:#475569;padding-bottom:24px;">
                      ${footerNote}
                    </td>
                  </tr>
                  ${
                    buttonLabel && buttonHref
                      ? `
                  <tr>
                    <td style="padding-bottom:20px;">
                      <a href="${buttonHref}" style="display:inline-block;border-radius:999px;background:linear-gradient(90deg,#3b82f6 0%,#38bdf8 100%);color:#ffffff;font-size:15px;font-weight:700;line-height:1;text-decoration:none;padding:15px 22px;">
                        ${buttonLabel}
                      </a>
                    </td>
                  </tr>`
                      : ""
                  }
                  ${
                    otpLabel && otpValue
                      ? `
                  <tr>
                    <td style="padding-bottom:20px;">
                      <div style="border-radius:20px;border:1px solid rgba(15,23,42,0.08);background:#f8fafc;padding:18px 20px;">
                        <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;padding-bottom:10px;">
                          ${otpLabel}
                        </div>
                        <div style="font-size:28px;font-weight:700;letter-spacing:0.2em;color:#0f172a;">
                          ${otpValue}
                        </div>
                      </div>
                    </td>
                  </tr>`
                      : ""
                  }
                  ${
                    buttonHref
                      ? `
                  <tr>
                    <td style="font-size:13px;line-height:1.7;color:#64748b;padding-bottom:18px;">
                      If the button does not work, copy and paste this link into your browser:<br />
                      <a href="${buttonHref}" style="color:#2563eb;word-break:break-all;">${buttonHref}</a>
                    </td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="border-top:1px solid rgba(15,23,42,0.08);padding-top:18px;font-size:13px;line-height:1.7;color:#64748b;">
                      Sent by ${appName}. If you did not request this, you can ignore this email. Need help? Contact
                      <a href="mailto:${supportEmail}" style="color:#2563eb;">${supportEmail}</a>.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}

function buildEmailText(job: EmailJob) {
  const lines = [job.heading, "", job.footerNote];

  if (job.buttonLabel && job.buttonHref) {
    lines.push("", `${job.buttonLabel}: ${job.buttonHref}`);
  }

  if (job.otpLabel && job.otpValue) {
    lines.push("", `${job.otpLabel}: ${job.otpValue}`);
  }

  lines.push(
    "",
    `Sent by ${getAppName()}. Need help? Contact ${getSupportEmail()}.`,
  );

  return lines.join("\n");
}

function buildStandardJob(
  actionType: SupportedEmailActionType,
  recipient: string,
  redirectTo: string | undefined,
  tokenHash: string | undefined,
  token: string | undefined,
): EmailJob {
  switch (actionType) {
    case "signup":
      return {
        actionType,
        buttonHref: buildConfirmLink(actionType, tokenHash, redirectTo),
        buttonLabel: "Confirm email",
        footerNote:
          "Confirm this address to activate your BrandBuild operator account and continue into the studio workspace.",
        heading: "Confirm your BrandBuild access",
        otpLabel: "Verification code",
        otpValue: token ?? null,
        previewText: "Confirm your BrandBuild account email.",
        recipient,
        subject: "Confirm your BrandBuild access",
      };
    case "invite":
      return {
        actionType,
        buttonHref: buildConfirmLink(actionType, tokenHash, redirectTo),
        buttonLabel: "Accept invite",
        footerNote:
          "You were invited into BrandBuild. Accept the invite and finish setting your password inside the app.",
        heading: "You’re invited to BrandBuild",
        otpLabel: "Invite code",
        otpValue: token ?? null,
        previewText: "Accept your BrandBuild invite.",
        recipient,
        subject: "You’re invited to BrandBuild",
      };
    case "magiclink":
      return {
        actionType,
        buttonHref: buildConfirmLink(actionType, tokenHash, redirectTo),
        buttonLabel: "Sign in to BrandBuild",
        footerNote:
          "Use this secure sign-in link to access BrandBuild without entering your password.",
        heading: "Your secure BrandBuild sign-in link",
        otpLabel: "One-time code",
        otpValue: token ?? null,
        previewText: "Your BrandBuild magic link is ready.",
        recipient,
        subject: "Your BrandBuild sign-in link",
      };
    case "recovery":
      return {
        actionType,
        buttonHref: buildConfirmLink(actionType, tokenHash, redirectTo),
        buttonLabel: "Reset password",
        footerNote:
          "Reset your BrandBuild password from this secure link, then return to the app to continue working.",
        heading: "Reset your BrandBuild password",
        otpLabel: "Recovery code",
        otpValue: token ?? null,
        previewText: "Reset your BrandBuild password.",
        recipient,
        subject: "Reset your BrandBuild password",
      };
    case "email":
      return {
        actionType,
        buttonHref: buildConfirmLink(actionType, tokenHash, redirectTo),
        buttonLabel: "Confirm sign-in",
        footerNote:
          "Use this one-time email sign-in link to continue into BrandBuild.",
        heading: "Confirm your BrandBuild sign-in",
        otpLabel: "One-time code",
        otpValue: token ?? null,
        previewText: "Confirm your BrandBuild sign-in.",
        recipient,
        subject: "Confirm your BrandBuild sign-in",
      };
    case "reauthentication":
      return {
        actionType,
        buttonHref: new URL("/account/security", getSiteUrl()).toString(),
        buttonLabel: "Open security settings",
        footerNote:
          "A sensitive security action requires another verification step. Enter this code in BrandBuild if you are prompted for reauthentication.",
        heading: "Confirm this BrandBuild security action",
        otpLabel: "Verification code",
        otpValue: token ?? null,
        previewText: "Confirm this BrandBuild security action.",
        recipient,
        subject: "Confirm this BrandBuild security action",
      };
    case "email_change":
      return {
        actionType,
        buttonHref: buildConfirmLink(actionType, tokenHash, redirectTo),
        buttonLabel: "Confirm email change",
        footerNote:
          "A change was requested for the email on your BrandBuild account. Confirm it only if you started the change.",
        heading: "Confirm your BrandBuild email change",
        otpLabel: "Verification code",
        otpValue: token ?? null,
        previewText: "Confirm your BrandBuild email change.",
        recipient,
        subject: "Confirm your BrandBuild email change",
      };
  }
}

function buildEmailChangeJobs(payload: HookPayload) {
  const currentEmail = payload.user.email?.trim();
  const newEmail = payload.user.new_email?.trim();
  const redirectTo = payload.email_data.redirect_to;
  const jobs: EmailJob[] = [];

  if (currentEmail && payload.email_data.token_hash_new && payload.email_data.token) {
    jobs.push({
      ...buildStandardJob(
        "email_change",
        currentEmail,
        redirectTo,
        payload.email_data.token_hash_new,
        payload.email_data.token,
      ),
      footerNote:
        "You are receiving this at the current email on your BrandBuild account. Confirm this message only if you requested the email change.",
      heading: "Confirm the email change from your current address",
      previewText: "Confirm the BrandBuild email change from your current address.",
      subject: "Confirm your BrandBuild email change",
    });
  }

  if (newEmail && payload.email_data.token_hash && payload.email_data.token_new) {
    jobs.push({
      ...buildStandardJob(
        "email_change",
        newEmail,
        redirectTo,
        payload.email_data.token_hash,
        payload.email_data.token_new,
      ),
      footerNote:
        "You are receiving this at the new email for your BrandBuild account. Confirm it to finish switching the sign-in address.",
      heading: "Confirm your new BrandBuild email",
      previewText: "Confirm your new BrandBuild email address.",
      subject: "Confirm your new BrandBuild email",
    });
  }

  if (jobs.length > 0) {
    return jobs;
  }

  const recipient = newEmail || currentEmail;

  if (!recipient) {
    return [];
  }

  return [
    buildStandardJob(
      "email_change",
      recipient,
      redirectTo,
      payload.email_data.token_hash || payload.email_data.token_hash_new,
      payload.email_data.token_new || payload.email_data.token,
    ),
  ];
}

function buildEmailJobs(payload: HookPayload) {
  const actionType = payload.email_data.email_action_type as SupportedEmailActionType;

  if (actionType === "email_change") {
    return buildEmailChangeJobs(payload);
  }

  const recipient =
    payload.user.email?.trim() ||
    payload.user.new_email?.trim() ||
    payload.email_data.old_email?.trim();

  if (!recipient) {
    return [];
  }

  return [
    buildStandardJob(
      actionType,
      recipient,
      payload.email_data.redirect_to,
      payload.email_data.token_hash,
      payload.email_data.token,
    ),
  ];
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed.", { status: 405 });
  }

  try {
    const rawBody = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    const webhook = new Webhook(
      normalizeWebhookSecret(getRequiredEnv("SEND_EMAIL_HOOK_SECRET")),
    );
    const payload = webhook.verify(rawBody, headers) as HookPayload;
    const jobs = buildEmailJobs(payload);

    if (jobs.length === 0) {
      return new Response("No emails to send.", { status: 200 });
    }

    const smtpTransport = getTransporter();

    for (const job of jobs) {
      await smtpTransport.sendMail({
        from: `${getFromName()} <${getFromEmail()}>`,
        html: buildEmailHtml(job),
        replyTo: getReplyToEmail(),
        subject: job.subject,
        text: buildEmailText(job),
        to: job.recipient,
      });
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("send-auth-email hook failed", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unable to send auth email.",
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 500,
      },
    );
  }
});
