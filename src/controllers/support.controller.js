import supportService from "../services/support.service.js";
import ServerError from "../helpers/error.helper.js";

class SupportController {
    async sendSupportEmail(req, res, next) {
        try {
            const { problem, description, email: bodyEmail, name: bodyName } = req.body;
            
            // Si el usuario está autenticado, usamos sus datos de la sesión
            // Si no, usamos los que vienen en el body (para soporte público)
            const email = req.user?.email || bodyEmail;
            const name = req.user?.name || bodyName;
            const username = req.user?.username;
            const tag = req.user?.tag;

            if (!problem || !description) {
                throw new ServerError("El problema y la descripción son requeridos", 400);
            }

            if (!email || !name) {
                throw new ServerError("Tu nombre y correo electrónico son requeridos para poder contactarte", 400);
            }

            await supportService.sendSupportTicket({ 
                problem, 
                description, 
                email, 
                name, 
                username, 
                tag 
            });

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
