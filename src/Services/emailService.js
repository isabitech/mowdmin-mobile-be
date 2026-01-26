import brevoClient from "../Config/email.js";
import * as brevo from '@getbrevo/brevo';

class EmailService {
    /**
     * Send a generic email using Brevo API
     * @param {string} to - Recipient email address
     * @param {string} subject - Email subject
     * @param {string} html - HTML content
     * @param {string} textContent - Plain text content (optional)
     * @returns {Promise<boolean>}
     */
    static async sendEmail(to, subject, html, textContent = null) {
        try {
            const sendSmtpEmail = new brevo.SendSmtpEmail();
            
            // Sender information from environment
            sendSmtpEmail.sender = {
                name: process.env.BREVO_SENDER_NAME || "Mowdministries App",
                email: process.env.BREVO_SENDER_EMAIL || "isabitechng@gmail.com"
            };
            
            // Recipient
            sendSmtpEmail.to = [{ email: to }];
            
            // Email content
            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = html;
            
            // Add plain text version if provided
            if (textContent) {
                sendSmtpEmail.textContent = textContent;
            }
            
            // Send email via Brevo API
            const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
            
            console.log(`✅ Email sent to ${to} - Subject: ${subject} - Message ID: ${response.messageId}`);
            return true;
        } catch (error) {
            const status = error?.response?.status;
            console.error(`❌ Failed to send email to ${to}:`, error.message);
            if (status) {
                console.error('Brevo HTTP Status:', status);
            }

            const brevoBody = error?.response?.data ?? error?.response?.body ?? error?.body;
            if (brevoBody) {
                console.error('Brevo API Error:', brevoBody);
            }

            if (status === 401) {
                console.error('Brevo auth failed (401). Check that BREVO_API_KEY is a valid Brevo API key and has Transactional Email permissions.');
            }
            throw new Error(`Email sending failed: ${error.message}`);
        }
    }

    /**
     * Send email verification OTP
     * @param {string} to - Recipient email
     * @param {string} otp - 4-digit OTP code
     * @param {string} name - User name
     * @returns {Promise<boolean>}
     */
    static async sendEmailVerificationOTP(to, otp, name = "User") {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email - Mowdministries</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
                    .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e1e5e9; border-top: none; }
                    .otp-container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center; }
                    .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
                    .verification-note { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; border-top: 1px solid #e1e5e9; padding-top: 20px; }
                    .btn { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Welcome to Mowdministries!</h1>
                    <p>We're excited to have you join our community</p>
                </div>
                <div class="content">
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Thank you for registering with Mowdministries App! To complete your registration and verify your email address, please use the verification code below:</p>
                    
                    <div class="otp-container">
                        <p style="margin: 0; font-size: 16px;">Your verification code is:</p>
                        <div class="otp-code">${otp}</div>
                        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Enter this code in the app to verify your email</p>
                    </div>
                    
                    <div class="verification-note">
                        <h3 style="margin-top: 0; color: #28a745;">⏰ Important Information:</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>This verification code will expire in <strong>10 minutes</strong></li>
                            <li>For your security, don't share this code with anyone</li>
                            <li>If you didn't register for Mowdministries, please ignore this email</li>
                        </ul>
                    </div>
                    
                    <p>Once verified, you'll have full access to all Mowdministries features including:</p>
                    <ul>
                        <li>📿 Prayer requests and community prayers</li>
                        <li>📚 Spiritual media and resources</li>
                        <li>🎪 Events and community gatherings</li>
                        <li>🛒 Christian products and merchandise</li>
                        <li>💝 Donation and partnership opportunities</li>
                    </ul>
                    
                    <p>Need help? Contact our support team - we're here to help!</p>
                    
                    <div class="footer">
                        <p><strong>Mowdministries App Team</strong></p>
                        <p>Building faith communities, one prayer at a time 🙏</p>
                        <p style="margin-top: 15px; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const textContent = `
            Welcome to Mowdministries, ${name}!
            
            Your email verification code is: ${otp}
            
            This code will expire in 10 minutes.
            
            Enter this code in the app to verify your email address and complete your registration.
            
            Thank you for joining our community!
            
            Mowdministries App Team
        `;
        
        return this.sendEmail(to, "Verify Your Email - Mowdministries App", html, textContent);
    }

    /**
     * Send a token email (e.g., password reset, verification)
     * @param {string} to - Recipient email
     * @param {string} token - Token/code to send
     * @param {string} purpose - Optional purpose description
     * @returns {Promise<boolean>}
     */
    static async sendTokenEmail(to, token, purpose = "Password Reset") {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${purpose} - Mowdministries</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .token { background: #4F46E5; color: white; padding: 15px 20px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 6px; margin: 20px 0; letter-spacing: 2px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Mowdministries App</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Your ${purpose.toLowerCase()} code is:</p>
                    <div class="token">${token}</div>
                    <p><strong>Important:</strong> This code will expire in 10 minutes for security reasons.</p>
                    <p>If you didn't request this ${purpose.toLowerCase()}, please ignore this email or contact our support team.</p>
                    <div class="footer">
                        <p>Thank you for using Mowdministries App!</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const textContent = `
            Hello,
            
            Your ${purpose} code is: ${token}
            
            This code will expire in 10 minutes.
            
            Thank you for using Mowdministries App!
        `;
        
        return this.sendEmail(to, `${purpose} - Mowdministries`, html, textContent);
    }

    /**
     * Send a welcome/onboarding email
     * @param {string} to - Recipient email
     * @param {string} name - User name
     * @returns {Promise<boolean>}
     */
    static async sendWelcomeEmail(to, name) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Mowdministries</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .welcome-message { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5; }
                    .cta-button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Welcome to Mowdministries!</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${name}</strong>,</p>
                    <div class="welcome-message">
                        <p>🎉 <strong>Welcome to Mowdministries!</strong> We're absolutely thrilled to have you join our community.</p>
                        <p>Your account has been successfully created, and you're now part of a growing family dedicated to spiritual growth and community connection.</p>
                    </div>
                    <p><strong>What's next?</strong></p>
                    <ul>
                        <li>Complete your profile to personalize your experience</li>
                        <li>Explore our media library and resources</li>
                        <li>Connect with events and activities in your area</li>
                        <li>Join our community discussions and prayer groups</li>
                    </ul>
                    <div class="footer">
                        <p>Thank you for joining us on this spiritual journey!</p>
                        <p><strong>The Mowdministries Team</strong></p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const textContent = `
            Hello ${name},
            
            Welcome to Mowdministries! We're excited to have you on board.
            
            Your account has been successfully created, and you're now part of our growing community.
            
            What's next?
            - Complete your profile to personalize your experience
            - Explore our media library and resources
            - Connect with events and activities in your area
            - Join our community discussions and prayer groups
            
            Thank you for joining us!
            
            The Mowdministries Team
        `;
        
        return this.sendEmail(to, "Welcome to Mowdministries - Let's Get Started!", html, textContent);
    }
}

export default EmailService;
