import mailerTransporter from "../config/mailer.config.js";
import ENVIRONMENT from "../config/environment.config.js";
import ServerError from "../helpers/error.helper.js";

class SupportController {
    async sendSupportEmail(req, res, next) {
        try {
            const { problem, description } = req.body;
            const { name, email, username, tag } = req.user;

            if (!problem || !description) {
                throw new ServerError("El problema y la descripción son requeridos", 400);
            }

            const mailOptions = {
                from: ENVIRONMENT.MAIL_USER,
                to: 'rodrisend@gmail.com', // Dirección fija de soporte
                subject: `[SOPORTE] Nuevo ticket de ${name}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e2e2; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #3f0e40; color: white; padding: 20px; text-align: center;">
                            <h1 style="margin: 0;">Ticket de Soporte</h1>
                        </div>
                        <div style="padding: 20px; color: #1d1c1d;">
                            <p><strong>Usuario:</strong> ${name} (${username}#${tag})</p>
                            <p><strong>Email:</strong> ${email}</p>
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

            await mailerTransporter.sendMail(mailOptions);

            res.status(200).json({
                ok: true,
                message: "Tu ticket de soporte ha sido enviado con éxito. Estaremos en contacto pronto."
            });
        } catch (error) {
            next(error);
        }
    }
}

const supportController = new SupportController();
export default supportController;
