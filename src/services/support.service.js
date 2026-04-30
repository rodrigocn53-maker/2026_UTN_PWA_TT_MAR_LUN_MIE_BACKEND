import mailerTransporter from "../config/mailer.config.js";
import ENVIRONMENT from "../config/environment.config.js";
import ServerError from "../helpers/error.helper.js";

class SupportService {
    /**
     * Sends a support email to the support team.
     * @param {Object} data - Support request data
     * @param {String} data.problem - Summary of the problem
     * @param {String} data.description - Detailed description
     * @param {String} data.email - User's email address
     * @param {String} data.name - User's name
     * @param {String} [data.username] - User's username (optional)
     * @param {String} [data.tag] - User's tag (optional)
     */
    async sendSupportTicket({ problem, description, email, name, username, tag }) {
        if (!problem || !description || !email || !name) {
            throw new ServerError("Todos los campos obligatorios deben estar presentes", 400);
        }

        const userDisplay = username && tag ? `${name} (${username}#${tag})` : name;

        const mailOptions = {
            from: ENVIRONMENT.MAIL_USER,
            to: 'rodrisend@gmail.com', // Fixed support email
            replyTo: email, // Allow replying directly to the user
            subject: `[SOPORTE] ${problem.substring(0, 50)}... de ${name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e2e2; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #4A154B; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">Ticket de Soporte</h1>
                    </div>
                    <div style="padding: 20px; color: #1d1c1d;">
                        <p><strong>Remitente:</strong> ${userDisplay}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Estado:</strong> ${username ? 'Usuario Autenticado' : 'Usuario Invitado / Público'}</p>
                        <hr style="border: none; border-top: 1px solid #e2e2e2; margin: 20px 0;">
                        <p><strong>Problema:</strong></p>
                        <div style="background: #f8f8f8; padding: 12px; border-radius: 4px; font-weight: bold;">
                            ${problem}
                        </div>
                        <p style="margin-top: 20px;"><strong>Descripción:</strong></p>
                        <div style="background: #f8f8f8; padding: 12px; border-radius: 4px; white-space: pre-wrap;">
                            ${description}
                        </div>
                    </div>
                    <div style="background-color: #f8f8f8; color: #616061; padding: 12px; text-align: center; font-size: 12px;">
                        Enviado desde el sistema de soporte de Slack PWA
                    </div>
                </div>
            `
        };

        try {
            return await mailerTransporter.sendMail(mailOptions);
        } catch (error) {
            console.error('[SupportService Error]', error);
            throw new ServerError("Error al enviar el ticket de soporte", 500);
        }
    }
}

const supportService = new SupportService();
export default supportService;
