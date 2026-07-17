import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env.js";
import type { ContactEmail } from "../types/contact.js";
import { AppError } from "../types/errors.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatReceivedAt(isoDate: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(isoDate));
}

function buildContactHtml(contact: ContactEmail): string {
  const company = contact.company?.trim() || "—";
  const phone = contact.phone?.trim() || "—";
  const receivedAt = formatReceivedAt(contact.submittedAt);

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Nuevo contacto desde gypsa.tech</title>
  </head>
  <body style="margin:0;padding:0;background:#f0f4f9;font-family:Arial,Helvetica,sans-serif;color:#0a1628;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:#0a1628;padding:24px 28px;">
                <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8bbef2;">GYPSA</p>
                <h1 style="margin:8px 0 0;font-size:20px;line-height:1.4;color:#ffffff;font-weight:700;">
                  Nuevo contacto desde gypsa.tech
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#334155;">
                  <tr>
                    <td style="padding:0 0 16px;border-bottom:1px solid #eef2f7;">
                      <strong style="display:block;color:#0a1628;margin-bottom:4px;">Nombre</strong>
                      ${escapeHtml(contact.name)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 0;border-bottom:1px solid #eef2f7;">
                      <strong style="display:block;color:#0a1628;margin-bottom:4px;">Empresa</strong>
                      ${escapeHtml(company)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 0;border-bottom:1px solid #eef2f7;">
                      <strong style="display:block;color:#0a1628;margin-bottom:4px;">Correo</strong>
                      <a href="mailto:${escapeHtml(contact.email)}" style="color:#1e4d82;text-decoration:none;">
                        ${escapeHtml(contact.email)}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 0;border-bottom:1px solid #eef2f7;">
                      <strong style="display:block;color:#0a1628;margin-bottom:4px;">Teléfono</strong>
                      ${escapeHtml(phone)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 0;border-bottom:1px solid #eef2f7;">
                      <strong style="display:block;color:#0a1628;margin-bottom:4px;">Mensaje</strong>
                      <div style="white-space:pre-wrap;">${escapeHtml(contact.message)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 0 0;">
                      <strong style="display:block;color:#0a1628;margin-bottom:4px;">Fecha y hora de recepción</strong>
                      ${escapeHtml(receivedAt)}
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
</html>`;
}

function buildContactText(contact: ContactEmail): string {
  const company = contact.company?.trim() || "—";
  const phone = contact.phone?.trim() || "—";

  return [
    "Nuevo contacto desde gypsa.tech",
    "",
    `Nombre: ${contact.name}`,
    `Empresa: ${company}`,
    `Correo: ${contact.email}`,
    `Teléfono: ${phone}`,
    "",
    "Mensaje:",
    contact.message,
    "",
    `Fecha y hora de recepción: ${formatReceivedAt(contact.submittedAt)}`,
  ].join("\n");
}

export class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
      throw new AppError(
        "SMTP credentials are not configured",
        500,
        "INTERNAL_ERROR",
      );
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
    }

    return this.transporter;
  }

  async sendContactEmail(contact: ContactEmail): Promise<void> {
    try {
      const transporter = this.getTransporter();

      // Temporal: diagnosticar autenticación SMTP (p. ej. 535 Authentication Failed)
      await transporter.verify();
      console.log("SMTP VERIFIED");

      await transporter.sendMail({
        from: `"GYPSA Web" <${env.SMTP_USER}>`,
        to: env.CONTACT_TO_EMAIL,
        replyTo: contact.email,
        subject: `[GYPSA] Nuevo contacto - ${contact.name}`,
        text: buildContactText(contact),
        html: buildContactHtml(contact),
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("[EmailService] Failed to send contact email:", error);

      throw new AppError(
        "Failed to send contact email",
        502,
        "EMAIL_SEND_FAILED",
      );
    }
  }
}

export const emailService = new EmailService();
