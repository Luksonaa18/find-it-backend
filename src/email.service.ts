import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, code: string) {
    await this.transporter.sendMail({
      from: `"FindIt" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Verify your FindIt Account',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">FindIt</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px; text-align: center;">
          <h2 style="color: #111827; font-size: 24px;">Verify Your Email</h2>
          <p style="color: #374151; font-size: 16px;">
            Thanks for creating an account on FindIt!<br>
            Enter the verification code below to activate your account:
          </p>

          <!-- Code box -->
          <div style="margin: 20px 0; font-size: 32px; font-weight: bold; color: #4f46e5; background: #f3f4f6; padding: 15px 0; border-radius: 8px; letter-spacing: 4px;">
            ${code}
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            This code will expire in 10 minutes.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>FindIt &copy; ${new Date().getFullYear()}. All rights reserved.</p>
          <p>If you did not request this email, you can safely ignore it.</p>
        </div>
      </div>
    `,
    });
  }
}
