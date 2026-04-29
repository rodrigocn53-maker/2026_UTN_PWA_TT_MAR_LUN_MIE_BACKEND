import ServerError from "../helpers/error.helper.js"
import workspaceMemberRepository from "../repository/member.repository.js"
import userRepository from "../repository/user.repository.js"
import jwt from 'jsonwebtoken'
import ENVIRONMENT from "../config/environment.config.js"
import mailerTransporter from "../config/mailer.config.js"

class MemberWorkspaceService {
    async isMember(user_id, workspace_id) {
        const member = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user_id)
        return !!member
    }

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

        if (!invitedUser.email_verified) {
            throw new ServerError('El usuario aún no ha verificado su cuenta', 400)
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
            subject: `¡Te han invitado a colaborar en un espacio de trabajo!`,
            html: `
                <div style="background-color: #f8f8f8; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                        <tr>
                            <td align="center" style="padding: 40px 0 20px 0; background-color: #4a154b;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Slack Clone</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="color: #1d1c1d; margin: 0 0 20px 0; font-size: 22px;">¡Hola! Has sido invitado</h2>
                                <p style="font-size: 16px; color: #454245; line-height: 1.6; margin-bottom: 30px;">
                                    Alguien te ha invitado a colaborar en un espacio de trabajo de nuestra plataforma. ¡Estamos ansiosos por tenerte a bordo!
                                </p>
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td align="center">
                                            <a href="${accept_link}" style="background-color: #007a5a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin-right: 10px;">Aceptar Invitación</a>
                                            <a href="${reject_link}" style="background-color: #e01e5a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Rechazar</a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="font-size: 14px; color: #616061; margin-top: 30px;">
                                    Si no esperabas esta invitación, puedes ignorar este correo de forma segura.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px; background-color: #f8f8f8; color: #ababad; font-size: 12px;">
                                Enviado por el equipo de Slack Clone &bull; 2026
                            </td>
                        </tr>
                    </table>
                </div>
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
    async leaveWorkspace(workspace_id, user_id) {
        const member = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user_id)
        if (!member) {
            throw new ServerError('No eres miembro de este espacio de trabajo', 404)
        }
        if (member.role === 'owner') {
            throw new ServerError('El creador no puede abandonar el espacio de trabajo. Debe eliminarlo o transferirlo.', 400)
        }
        await workspaceMemberRepository.deleteById(member._id)
        return true
    }

    async updateRole(workspace_id, user_id, new_role, request_user_id) {
        const targetMember = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user_id);
        if (!targetMember) {
            throw new ServerError('Usuario no es miembro del espacio', 404);
        }
        if (targetMember.role === 'owner') {
            throw new ServerError('No se puede cambiar el rol del propietario', 400);
        }
        await workspaceMemberRepository.updateRoleById(targetMember._id, new_role);
        return true;
    }

    async removeMember(workspace_id, user_id, request_user_id) {
        const targetMember = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user_id);
        if (!targetMember) {
            throw new ServerError('Usuario no es miembro del espacio', 404);
        }
        if (targetMember.role === 'owner') {
            throw new ServerError('No se puede eliminar al propietario', 400);
        }
        await workspaceMemberRepository.deleteById(targetMember._id);
        return true;
    }
}

const memberWorkspaceService = new MemberWorkspaceService()

export default memberWorkspaceService