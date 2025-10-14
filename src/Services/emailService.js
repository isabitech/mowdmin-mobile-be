import transporter from "../Config/email.js";

class EmailService {

    static async sendEmail(to, subject, html) {
        try {
            await transporter.sendMail({
                from: `"Mowdministries" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
            });
            return true;
        } catch (err) {
            console.error("❌ Email sending failed:", err);
            throw new Error("Unable to send email");
        }
    }

    static async sendTokenEmail(to, token, purpose = "Password Reset") {
        const html = `
            <p>Hello,</p>
            <p>Your ${purpose} code is:</p>
            <h2>${token}</h2>
            <p>This code will expire in 10 minutes.</p>
            <p>Thank you for using Mowdministries App!</p>
        `;
        return await this.sendEmail(to, `${purpose} - Mowdministries`, html);
    }
}

export default EmailService;
