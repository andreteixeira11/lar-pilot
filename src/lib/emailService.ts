// Email Service
// This would integrate with an email provider (Resend, SendGrid, etc.)

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmation(
    email: string,
    paymentDetails: {
      plan: string;
      amount: number;
      reference?: string;
      entidade?: string;
    }
  ): Promise<void> {
    const template: EmailTemplate = {
      to: email,
      subject: `Confirmação de Pagamento - ${paymentDetails.plan}`,
      html: this.getPaymentConfirmationTemplate(paymentDetails),
    };

    console.log('Sending payment confirmation email:', template);
    // In production, this would call an email service API
    // await fetch('/api/send-email', { method: 'POST', body: JSON.stringify(template) });
  }

  /**
   * Send payment reference email (for Multibanco)
   */
  static async sendPaymentReference(
    email: string,
    paymentDetails: {
      plan: string;
      amount: number;
      reference: string;
      entidade: string;
    }
  ): Promise<void> {
    const template: EmailTemplate = {
      to: email,
      subject: `Referência de Pagamento - ${paymentDetails.plan}`,
      html: this.getPaymentReferenceTemplate(paymentDetails),
    };

    console.log('Sending payment reference email:', template);
    // In production, this would call an email service API
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const template: EmailTemplate = {
      to: email,
      subject: 'Bem-vindo ao Monumental Atanti',
      html: this.getWelcomeTemplate(name),
    };

    console.log('Sending welcome email:', template);
    // In production, this would call an email service API
  }

  /**
   * Send subscription expiry reminder
   */
  static async sendSubscriptionReminder(
    email: string,
    daysRemaining: number
  ): Promise<void> {
    const template: EmailTemplate = {
      to: email,
      subject: 'A sua subscrição está prestes a expirar',
      html: this.getSubscriptionReminderTemplate(daysRemaining),
    };

    console.log('Sending subscription reminder:', template);
    // In production, this would call an email service API
  }

  // Email Templates
  private static getPaymentConfirmationTemplate(paymentDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #247d7f, #bc941a); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background: #247d7f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Pagamento Confirmado</h1>
            </div>
            <div class="content">
              <h2>Obrigado pela sua subscrição!</h2>
              <p>O seu pagamento foi confirmado com sucesso.</p>
              <p><strong>Plano:</strong> ${paymentDetails.plan}</p>
              <p><strong>Valor:</strong> ${paymentDetails.amount}€</p>
              ${paymentDetails.reference ? `<p><strong>Referência:</strong> ${paymentDetails.reference}</p>` : ''}
              ${paymentDetails.entidade ? `<p><strong>Entidade:</strong> ${paymentDetails.entidade}</p>` : ''}
              <a href="https://financasacessiveis.pt" class="button">Aceder à Plataforma</a>
            </div>
            <div class="footer">
              <p>© 2024 Monumental Atanti. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getPaymentReferenceTemplate(paymentDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #247d7f, #bc941a); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .reference-box { background: white; border: 2px solid #247d7f; padding: 20px; margin: 20px 0; text-align: center; }
            .reference-box h3 { color: #247d7f; margin: 0 0 10px 0; }
            .reference-box .value { font-size: 24px; font-weight: bold; color: #bc941a; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Referência de Pagamento</h1>
            </div>
            <div class="content">
              <h2>Aguardamos o seu pagamento</h2>
              <p>Utilize os dados abaixo para efetuar o pagamento por Multibanco:</p>
              <div class="reference-box">
                <h3>Entidade</h3>
                <div class="value">${paymentDetails.entidade}</div>
              </div>
              <div class="reference-box">
                <h3>Referência</h3>
                <div class="value">${paymentDetails.reference}</div>
              </div>
              <div class="reference-box">
                <h3>Valor</h3>
                <div class="value">${paymentDetails.amount}€</div>
              </div>
              <p><strong>Plano:</strong> ${paymentDetails.plan}</p>
              <p>Após a confirmação do pagamento, receberá um email de confirmação e o seu plano será ativado automaticamente.</p>
            </div>
            <div class="footer">
              <p>© 2024 Monumental Atanti. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getWelcomeTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #247d7f, #bc941a); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background: #247d7f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bem-vindo ao Monumental Atanti</h1>
            </div>
            <div class="content">
              <h2>Olá ${name}!</h2>
              <p>Obrigado por se registar na nossa plataforma de gestão de alojamento local.</p>
              <p>Estamos muito felizes por tê-lo connosco!</p>
              <p>Com a nossa plataforma, poderá:</p>
              <ul>
                <li>Gerir todas as suas reservas num só lugar</li>
                <li>Acompanhar receitas e despesas em tempo real</li>
                <li>Gerar relatórios INE automaticamente</li>
                <li>Calcular e submeter a taxa turística</li>
              </ul>
              <a href="https://financasacessiveis.pt" class="button">Começar Agora</a>
            </div>
            <div class="footer">
              <p>© 2024 Monumental Atanti. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getSubscriptionReminderTemplate(daysRemaining: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #247d7f, #bc941a); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background: #247d7f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
            .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Renovação de Subscrição</h1>
            </div>
            <div class="content">
              <div class="alert">
                <strong>Atenção:</strong> A sua subscrição expira em ${daysRemaining} dias.
              </div>
              <p>Para continuar a usufruir de todos os benefícios da nossa plataforma, renove a sua subscrição.</p>
              <a href="https://financasacessiveis.pt/subscriptions" class="button">Renovar Subscrição</a>
            </div>
            <div class="footer">
              <p>© 2024 Monumental Atanti. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
