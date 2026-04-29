import mailerTransporter from './src/config/mailer.config.js';
import ENVIRONMENT from './src/config/environment.config.js';

console.log("Testing mailer with user:", ENVIRONMENT.MAIL_USER);

async function testMail() {
    try {
        const info = await mailerTransporter.sendMail({
            from: ENVIRONMENT.MAIL_USER,
            to: ENVIRONMENT.MAIL_USER, // Send to self
            subject: "Test Email from Slack Clone",
            text: "If you see this, the mailer is working."
        });
        console.log("Success! MessageId:", info.messageId);
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}

testMail();
