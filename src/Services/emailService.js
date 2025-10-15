import transporter from "../Config/email.js";

class EmailService {
    /**
     * Send a generic email
     * @param {string} to - Recipient email address
     * @param {string} subject - Email subject
     * @param {string} html - HTML content
     * @returns {Promise<boolean>}
     */
    static async sendEmail(to, subject, html) {
      
            await transporter.sendMail({
                from: `"Mowdministries" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
            });
            console.log(`✅ Email sent to ${to} - Subject: ${subject}`);
            return true;
        
            
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
            <p>Hello,</p>
            <p>Your ${purpose} code is:</p>
            <h2>${token}</h2>
            <p>This code will expire in 10 minutes.</p>
            <p>Thank you for using Mowdministries App!</p>
        `;
        return this.sendEmail(to, `${purpose} - Mowdministries`, html);
    }

    /**
     * Optional: Send a welcome/onboarding email
     * @param {string} to
     * @param {string} name
     */
    static async sendWelcomeEmail(to, name) {
        const html = `
            <p>Hello ${name},</p>
            <p>Welcome to Mowdministries! We're excited to have you on board.</p>
            <p>Thank you for joining us.</p>
        `;
        return this.sendEmail(to, "Welcome to Mowdministries", html);
    }
}

export default EmailService;
