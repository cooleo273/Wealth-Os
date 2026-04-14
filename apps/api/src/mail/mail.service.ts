import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.ethereal.email'),
      port: this.config.get<number>('SMTP_PORT', 587),
      auth: {
        user: this.config.get<string>('SMTP_USER', ''),
        pass: this.config.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async sendWelcome(to: string, name: string) {
    const from = this.config.get<string>('EMAIL_FROM', 'no-reply@wealth.dev');
    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: 'Welcome to Wealth Dashboard',
        html: `
          <h1>Welcome, ${name || 'there'}!</h1>
          <p>Your account has been created successfully.</p>
          <p>Start managing your wealth today.</p>
        `,
      });
    } catch (err) {
      this.logger.warn(`Failed to send welcome email to ${to}: ${(err as Error).message}`);
    }
  }
}
