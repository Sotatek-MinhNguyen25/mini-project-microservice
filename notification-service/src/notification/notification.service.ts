import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;
  private readonly templateDir: string;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<boolean>('mail.secure'),
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });
    const distTemplateDir = path.join(process.cwd(), 'dist', 'notification', 'templates');
    this.templateDir = fs.existsSync(distTemplateDir)
      ? distTemplateDir
      : path.join(process.cwd(), 'src', 'notification', 'templates');
  }

  private loadTemplate(templateName: string, variables: Record<string, string>): string {
    const templatePath = path.join(this.templateDir, `${templateName}.html`);
    try {
      let template = fs.readFileSync(templatePath, 'utf-8');
      for (const [key, value] of Object.entries(variables)) {
        template = template.replace(`{{${key}}}`, value);
      }
      return template;
    } catch (error) {
      throw new Error(`Failed to load template ${templateName}: ${error.message}`);
    }
  }

  async sendEmail(to: string, subject: string, content: { text?: string; html?: string }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('mail.from'),
        to,
        subject,
        text: content.text,
        html: content.html,
      });
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const subject = 'Welcome to Our Platform!';
    const html = this.loadTemplate('welcome', {
      username,
      frontendUrl: this.configService.get<string>('app.frontendUrl') ?? '',
    });
    await this.sendEmail(to, subject, { html });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const subject = 'Password Reset Request';
    const html = this.loadTemplate('password-reset', {
      resetUrl: `${this.configService.get<string>('app.frontendUrl')}/reset-password?token=${resetToken}`,
      resetToken,
    });
    await this.sendEmail(to, subject, { html });
  }
}
