import nodemailer from 'nodemailer';
import { CustomError } from './custom-error.js';
import db from '../db/db.js';
import { usersTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

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
        from: '"Satsankalpa Advocacy Membership" <admin@satsankalpa.org>',
        to: 'eshwarbalajiyogesh@gmail.com',
        subject: 'Email Service Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Email Service is Working!</h2>
            <p>The email service has been successfully initialized and is ready to use.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;">This is an automated verification email sent on service startup.</p>
            </div>
            <p>Best regards,<br>Satsankalpa Advocacy Team</p>
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
        from: '"Satsankalpa Advocacy Membership" <admin@satsankalpa.org>',
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
        <h2 style="color: #2c3e50;">Welcome to Satsankalpa Advocacy Membership!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for signing up with us. We're thrilled to welcome you to our community. </p>
        <p>We have received your application and it is currently under review. We will notify you of its status via email.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">Should you have any questions in the meantime, please do not hesitate to contact us at engage@satsankalpa.org.</p>
        </div>
        <p>Best regards,<br>Satsankalpa Advocacy Team</p>
      </div>
    `;
  }

  private getNewUserNotificationTemplate(newUserName: string, newUserEmail: string, location: any): string {
    const locationStr = Array.isArray(location) && location.length > 0 
      ? location.join(', ')
      : 'Not specified';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">New User Signup Notification</h2>
        <p>A new user has signed up for the Advocacy membership.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>New User:</strong> ${newUserName}</p>
          <p style="margin: 10px 0 0 0;"><strong>Email:</strong> ${newUserEmail}</p>
          <p style="margin: 10px 0 0 0;"><strong>Location:</strong> ${locationStr}</p>
        </div>
        <p>Best regards,<br>Satsankalpa Advocacy Team</p>
      </div>
    `;
  }

  private getOTPTemplate(otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Your Satsankalpa Advocacy Verification Code</h2>
        <p>Here is your verification code:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h1 style="color: #2c3e50; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>Satsankalpa Advocacy Team</p>
      </div>
    `;
  }

  private getApprovalTemplate(name: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #27ae60;">Satasankalpa Membership Application Approved!</h2>
        <p>Dear ${name},</p>
        <p>We are pleased to inform you that your application has been approved!</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">Our advocacy team administrators will be in touch to discuss the next steps and how you can get involved.</p>
        </div>
        <p>Best regards,<br>Satsankalpa Advocacy Team</p>
      </div>
    `;
  }

  private getRejectionTemplate(name: string, reason?: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e74c3c;">Application Status Update</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your interest in Satsankalpa Advocacy Membership program.</p>
        <p>We regret to inform you that your application was not approved at this time.</p>
        ${reason ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
        </div>
        ` : ''}
        <p>We encourage you to reach out to us at engage@satsankalpa.org to receive feedback on your application before you consider applying again in the future.</p>
        <p>Best regards,<br>Satsankalpa Advocacy Team</p>
      </div>
    `;
  }

  // Public methods to send different types of emails
  async sendSignupEmail(to: string, name: string, location: any): Promise<void> {
    // Send welcome email to the new user
    await this.sendEmail({
      to,
      subject: 'Welcome to Advocacy Form!',
      html: this.getSignupTemplate(name),
    });

    // Notify all admins about the new signup
    await this.notifyUsersOfType('admin', name, to, location);
  }

  async notifyUsersOfType(
    userType: 'admin' | 'user' | 'applicant' | 'disabled', 
    newUserName: string,
    newUserEmail: string,
    location: any
  ): Promise<void> {
    try {
      // Get all users of the specified type from the database
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.type, userType));

      // Send notification email to each user
      for (const user of users) {
        if (user.email) {
          await this.sendEmail({
            to: user.email,
            subject: 'New User Signup Notification',
            html: this.getNewUserNotificationTemplate(newUserName, newUserEmail, location),
          });
        }
      }
    } catch (error) {
      console.error('Failed to send notifications:', error);
      throw new CustomError('Failed to send notifications', 500);
    }
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
