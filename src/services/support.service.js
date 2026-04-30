import mailerTransporter from "../config/mailer.config.js";
import ENVIRONMENT from "../config/environment.config.js";
import ServerError from "../helpers/error.helper.js";
import Counter from "../models/counter.model.js";
import SupportTicket from "../models/supportTicket.model.js";

class SupportService {
    /**
     * Gets the next sequence number for a counter
     * @param {String} name - Counter name
     * @returns {Number} next sequence
     */
    async getNextSequence(name) {
        const counter = await Counter.findByIdAndUpdate(
            name,
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        return counter.seq;
    }

    /**
     * Sends a support email to the support team and a confirmation to the user.
     */
    async sendSupportTicket({ problem, description, email, name, username, tag, userId }) {
        if (!problem || !description || !email || !name) {
            throw new ServerError("Todos los campos obligatorios deben estar presentes", 400);
        }

        // Generar ID autoincremental de 6 dígitos
        const seq = await this.getNextSequence('support_ticket');
        const ticketId = seq.toString().padStart(6, '0');

        // Guardar el ticket en la base de datos
        const newTicket = new SupportTicket({
            ticketId,
            name,
            email,
            problem,
            description,
            user: userId || null
        });
        await newTicket.save();

        const userDisplay = username && tag ? `${name} (${username}#${tag})` : name;

        // 1. Email para el Equipo de Soporte
        const supportMailOptions = {
            from: ENVIRONMENT.MAIL_USER,
            to: 'rodrisend@gmail.com',
            replyTo: email,
            subject: `[SOPORTE #${ticketId}] ${problem.substring(0, 50)}...`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e2e2; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #4A154B; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">Ticket de Soporte #${ticketId}</h1>
                    </div>
                    <div style="padding: 20px; color: #1d1c1d;">
                        <p><strong>Remitente:</strong> ${userDisplay}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Estado:</strong> ${username ? 'Usuario Autenticado' : 'Usuario Invitado'}</p>
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
                </div>
            `
        };

        // 2. Email de Confirmación para el Usuario
        const userMailOptions = {
            from: ENVIRONMENT.MAIL_USER,
            to: email,
            subject: `Recibimos tu consulta de soporte - Ticket #${ticketId}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e2e2; border-radius: 8px;">
                    <p>Hola <strong>${name}</strong>,</p>
                    <p>A la brevedad nos contactaremos para brindarte una respuesta.</p>
                    <p style="color: #616061; font-style: italic;">Este correo es un envío automático. Por favor, no respondas a este mensaje ni generes una nueva consulta en "Soporte".</p>
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
                        <span style="font-size: 18px; font-weight: bold; color: #4A154B;">Tu número de consulta es: #${ticketId}</span>
                    </div>
                    <p>Equipo de soporte.</p>
                </div>
            `
        };

        try {
            await mailerTransporter.sendMail(supportMailOptions);
            await mailerTransporter.sendMail(userMailOptions);
            return { ticketId };
        } catch (error) {
            console.error('[SupportService Error]', error);
            throw new ServerError("Error al procesar el ticket de soporte", 500);
        }
    }
}

const supportService = new SupportService();
export default supportService;
