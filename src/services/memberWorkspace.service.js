import ServerError from "../helpers/error.helper.js"
import workspaceMemberRepository from "../repository/member.repository.js"
import userRepository from "../repository/user.repository.js"
import jwt from 'jsonwebtoken'
import ENVIRONMENT from "../config/environment.config.js"
import mailerTransporter from "../config/mailer.config.js"

class MemberWorkspaceService {
    async getWorkspaces(user_id) {
        //traer la lista de espacios de trabajo relacionados a el usuario logueado
        const workspacesList = await workspaceMemberRepository.getWorkspaceListByUserId(user_id)
        return workspacesList
    }
    async create(user_id, workspace_id, role) {
        //Checkear que no exista un membresia para ese usuario
        const result = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user_id)

        if(result){
            throw new ServerError('Este miembro ya existe')
        }

        await workspaceMemberRepository.create(workspace_id, user_id, role)
    }

    async getMemberList(workspace_id) {
        try {
            if (!workspace_id) {
                throw new ServerError("Todos los campos son obligatorios", 404)
            }

            return await workspaceMemberRepository.getMemberList(
                workspace_id
            )
        } catch (error) {
            throw error
        }
    }

    async inviteMember(workspace_id, invited_email, role) {
        if (!workspace_id || !invited_email || !role) {
            throw new ServerError('Todos los campos son obligatorios', 400)
        }

        const invitedUser = await userRepository.getByEmail(invited_email)
        if (!invitedUser) {
            throw new ServerError('El usuario invitado no existe', 404)
        }

        const existingMember = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, invitedUser._id)
        if (existingMember) {
            if (existingMember.acceptInvitation === 'pending') {
                throw new ServerError('Ya hay una invitación pendiente para este usuario', 400)
            }
            throw new ServerError('El usuario ya es miembro de este espacio de trabajo', 400)
        }

        const newMember = await workspaceMemberRepository.create(workspace_id, invitedUser._id, role)

        const accept_token = jwt.sign(
            {
                email: invited_email,
                workspace_id,
                action: 'accepted'
            },
            ENVIRONMENT.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        )

        const reject_token = jwt.sign(
            {
                email: invited_email,
                workspace_id,
                action: 'rejected'
            },
            ENVIRONMENT.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        )

        const accept_link = `${ENVIRONMENT.URL_BACKEND}/api/workspace/${workspace_id}/member/?token=${accept_token}`
        const reject_link = `${ENVIRONMENT.URL_BACKEND}/api/workspace/${workspace_id}/member/?token=${reject_token}`

        await mailerTransporter.sendMail({
            from: ENVIRONMENT.MAIL_USER,
            to: invited_email,
            subject: `Invitación a unirse al espacio de trabajo`,
            html: `
                <h1>Has sido invitado a un espacio de trabajo</h1>
                <p>Haz clic en uno de los siguientes enlaces para aceptar o rechazar la invitación:</p>
                <a href="${accept_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Aceptar Invitación</a>
                <br/><br/>
                <a href="${reject_link}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Rechazar Invitación</a>
            `
        })

        return newMember
    }

    async respondToInvitation(token) {
        if (!token) {
            throw new ServerError('Token no proporcionado', 400)
        }

        try {
            const { email, workspace_id, action } = jwt.verify(token, ENVIRONMENT.JWT_SECRET_KEY)

            const user = await userRepository.getByEmail(email)
            if (!user) {
                throw new ServerError('Usuario no encontrado', 404)
            }

            const membership = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user._id)
            if (!membership) {
                throw new ServerError('Invitación no encontrada', 404)
            }

            if (membership.acceptInvitation !== 'pending') {
                throw new ServerError('Ya has respondido a esta invitación', 400)
            }

            const updatedMembership = await workspaceMemberRepository.updateInvitationStatus(membership._id, action)
            return updatedMembership

        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ServerError('Token inválido o expirado', 401)
            }
            throw error
        }
    }
}

const memberWorkspaceService = new MemberWorkspaceService()

export default memberWorkspaceService