import nodemailer from "nodemailer";

// Using Ethereal Email for testing (fake SMTP service)
// In production, replace with SendGrid, Mailgun, Amazon SES, etc.
let transporter;

const setupTransporter = async () => {
  if (process.env.NODE_ENV === "production" && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test account automatically for dev if not configured
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("📨 Ethereal Email test account configured.");
  }
};

setupTransporter();

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) await setupTransporter();

  try {
    const info = await transporter.sendMail({
      from: '"Clarior CRM" <noreply@clarior.com>',
      to,
      subject,
      text: text || "Please view this email in an HTML-compatible client.",
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    
    // If using Ethereal, log the URL to preview the email
    if (info.messageId.includes("ethereal")) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

// Standard Templates
export const emailTemplates = {
  welcome: (name, verificationUrl) => ({
    subject: "Welcome to Clarior CRM - Verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0f172a;">Welcome to Clarior, ${name}!</h2>
        <p style="color: #475569;">Thank you for registering. Please verify your email address to get started.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="color: #64748b; font-size: 12px;">If the button doesn't work, copy and paste this link: ${verificationUrl}</p>
      </div>
    `
  }),
  passwordReset: (resetUrl) => ({
    subject: "Reset your Clarior CRM password",
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0f172a;">Password Reset Request</h2>
        <p style="color: #475569;">You recently requested to reset your password for your Clarior CRM account. Click the button below to reset it.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #475569;">This link will expire in 1 hour.</p>
        <p style="color: #64748b; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `
  })
};
