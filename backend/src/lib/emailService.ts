import nodemailer from 'nodemailer';
import { CustomError } from './custom-error.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create a test account using Ethereal
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Create reusable transporter object using the default SMTP transport
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'admin@satsankalpa.org',
          pass: 'wjwl xrsa aofh ujyg'
        },
      });

      // Send verification email on startup
      console.log('Sending startup verification email...');
      await this.transporter.sendMail({
        from: '"Advocacy Form" <admin@satsankalpa.org>',
        to: 'eshwarbalajiyogesh@gmail.com',
        subject: 'Email Service Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Email Service is Working!</h2>
            <p>The email service has been successfully initialized and is ready to use.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;">This is an automated verification email sent on service startup.</p>
            </div>
            <p>Best regards,<br>The Advocacy Form Team</p>
          </div>
        `
      });
      console.log('Startup verification email sent successfully!');
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      throw new CustomError('Failed to initialize email service', 500);
    }
  }

  private async sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
    console.log('Sending email to:', to);
    try {
      const info = await this.transporter.sendMail({
        from: '"Advocacy Form" <noreply@advocacyform.com>',
        to,
        subject,
        html,
      });

      // Log the preview URL for testing
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new CustomError('Failed to send email', 500);
    }
  }

  // Email Templates
  private getSignupTemplate(name: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Welcome to Advocacy Form!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for signing up with us. We're excited to have you on board!</p>
        <p>Your account has been successfully created.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <p>Best regards,<br>The Advocacy Form Team</p>
      </div>
    `;
  }

  private getOTPTemplate(otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Your Verification Code</h2>
        <p>Here is your verification code:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h1 style="color: #2c3e50; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>The Advocacy Form Team</p>
      </div>
    `;
  }

  private getApprovalTemplate(name: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #27ae60;">Application Approved!</h2>
        <p>Dear ${name},</p>
        <p>We are pleased to inform you that your application has been approved!</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">You can now proceed with the next steps in your application process.</p>
        </div>
        <p>Best regards,<br>The Advocacy Form Team</p>
      </div>
    `;
  }

  private getRejectionTemplate(name: string, reason?: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e74c3c;">Application Status Update</h2>
        <p>Dear ${name},</p>
        <p>We regret to inform you that your application has not been approved at this time.</p>
        ${reason ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
        </div>
        ` : ''}
        <p>We encourage you to review the feedback and consider applying again in the future.</p>
        <p>Best regards,<br>The Advocacy Form Team</p>
      </div>
    `;
  }

  // Public methods to send different types of emails
  async sendSignupEmail(to: string, name: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to Advocacy Form!',
      html: this.getSignupTemplate(name),
    });
  }

  async sendOTPEmail(to: string, otp: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your Verification Code',
      html: this.getOTPTemplate(otp),
    });
  }

  async sendApprovalEmail(to: string, name: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Application Approved!',
      html: this.getApprovalTemplate(name),
    });
  }

  async sendRejectionEmail(to: string, name: string, reason?: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Application Status Update',
      html: this.getRejectionTemplate(name, reason),
    });
  }
}

export const emailService = new EmailService(); 