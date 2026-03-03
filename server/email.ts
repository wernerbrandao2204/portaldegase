import { ENV } from "./_core/env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Envia um email usando o serviço de email integrado do Manus
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.error("[Email] Serviço de email não configurado");
    return false;
  }

  try {
    const endpoint = new URL(
      "webdevtoken.v1.WebDevService/SendEmail",
      ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`
    ).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text || payload.html.replace(/<[^>]*>/g, ""),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        `[Email] Falha ao enviar email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar email:", error);
    return false;
  }
}

/**
 * Template de email para reset de senha
 */
export function getPasswordResetEmailTemplate(
  userName: string,
  resetLink: string
): { subject: string; html: string } {
  return {
    subject: "Redefinir sua senha - DEGASE",
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
          .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DEGASE - Redefinir Senha</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            
            <a href="${resetLink}" class="button">Redefinir Senha</a>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
              ${resetLink}
            </p>
            
            <div class="warning">
              <strong>⚠️ Aviso de Segurança:</strong> Este link expira em 24 horas. Se você não solicitou esta redefinição, ignore este email.
            </div>
            
            <p>Se tiver dúvidas, entre em contato com o suporte administrativo.</p>
          </div>
          
          <div class="footer">
            <p>© 2026 DEGASE - Departamento Geral de Ações Socioeducativas</p>
            <p>Este é um email automático. Não responda a este endereço.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * Template de email para notificação de segurança
 */
export function getSecurityNotificationEmailTemplate(
  title: string,
  message: string,
  details: Record<string, string>
): { subject: string; html: string } {
  const detailsHtml = Object.entries(details)
    .map(([key, value]) => `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${key}:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${value}</td></tr>`)
    .join("");

  return {
    subject: `🔒 Notificação de Segurança: ${title} - DEGASE`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .footer { background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 ${title}</h1>
          </div>
          
          <div class="content">
            <p>${message}</p>
            
            <table class="details-table">
              ${detailsHtml}
            </table>
            
            <p style="color: #d32f2f;"><strong>Se você não realizou esta ação, entre em contato com o suporte imediatamente.</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2026 DEGASE - Departamento Geral de Ações Socioeducativas</p>
            <p>Este é um email automático. Não responda a este endereço.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}
