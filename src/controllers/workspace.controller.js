import workspaceMemberRepository from "../repository/member.repository.js"
import memberWorkspaceService from "../services/memberWorkspace.service.js"
import workspaceService from "../services/workspace.service.js"
import notificationService from "../services/notification.service.js"
import userRepository from "../repository/user.repository.js"
import ServerError from "../helpers/error.helper.js"

class WorkspaceController {
    async getWorkspaces(request, response, next) {
        try {
            //Cliente consultante
            const user = request.user

            //Traer la lista de espacios de trabajo asociados al usuario
            const workspaces = await workspaceMemberRepository.getWorkspaceListByUserId(user.id)
            response.json(
                {
                    ok: true,
                    status: 200,
                    message: 'Espacios de trabajo obtenidos',
                    data: {
                        workspaces
                    }
                }
            )
        }
        catch (error) {
            next(error)
        }
    }

    async create(request, response, next) {
        try {
            const { title, description } = request.body
            const user = request.user
            await workspaceService.create(
                title,
                description,
                'test_1.png',
                user.id
            )

            return response.status(201).json({
                ok: true,
                status: 201,
                message: "Espacio de trabajo creado con exito"
            })
        } catch (error) {
            next(error)
        }
    }

      async getById(req, res, next) {
        const { workspace_id } = req.params
        try {
            const workspace = await workspaceService.getOne(workspace_id)
            const members = await memberWorkspaceService.getMemberList(workspace_id)
            res.json(
                {
                    ok: true,
                    status: 200,
                    message: 'Espacio de trabajo obtenido',
                    data: {
                        workspace,
                        members: members
                    }
                }
            )
        } catch (error) {
            next(error)
        }
    }
    async inviteMember(req, res, next) {
        const { workspace_id } = req.params
        const { identifier, role } = req.body
        try {
            if (identifier.includes('@')) {
                // Invitación por Email
                await memberWorkspaceService.inviteMember(workspace_id, identifier, role)
            } else if (identifier.includes('#')) {
                // Invitación por ID Público (Nombre#TAG)
                const [username, tag] = identifier.split('#');
                const invitedUser = await userRepository.getByUsernameAndTag(username.toLowerCase(), tag.toUpperCase());
                
                if (!invitedUser) {
                    throw new ServerError('Usuario no encontrado', 404);
                }

                // Verificar si ya es miembro
                const isMember = await memberWorkspaceService.isMember(invitedUser._id, workspace_id);
                if (isMember) {
                    throw new ServerError('El usuario ya es miembro de este espacio', 400);
                }

                await notificationService.createInvitation(req.user.id, invitedUser._id, workspace_id);
            } else {
                throw new ServerError('Formato de identificador inválido (usa Email o Nombre#TAG)', 400);
            }

            res.status(201).json({
                ok: true,
                status: 201,
                message: 'Invitación procesada con éxito'
            })
        } catch (error) {
            next(error)
        }
    }

    async respondToInvitation(req, res, next) {
        const { token } = req.query
        try {
            const result = await memberWorkspaceService.respondToInvitation(token)
            res.status(200).json({
                ok: true,
                status: 200,
                message: `Invitación ${result.acceptInvitation} con éxito`,
                data: result
            })
        } catch (error) {
            next(error)
        }
    }
    async update(req, res, next) {
        const { workspace_id } = req.params
        const { title, description, url_image } = req.body
        try {
            const updated = await workspaceService.update(workspace_id, title, description, url_image)
            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Espacio de trabajo actualizado con éxito',
                data: { workspace: updated }
            })
        } catch (error) {
            next(error)
        }
    }

    async delete(req, res, next) {
        const { workspace_id } = req.params
        try {
            await workspaceService.delete(workspace_id)
            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Espacio de trabajo eliminado con éxito'
            })
        } catch (error) {
            next(error)
        }
    }

    async leave(req, res, next) {
        const { workspace_id } = req.params
        const user_id = req.user.id
        try {
            await memberWorkspaceService.leaveWorkspace(workspace_id, user_id)
            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Has abandonado el espacio de trabajo con éxito'
            })
        } catch (error) {
            next(error)
        }
    }
}

const workspaceController = new WorkspaceController()

export default workspaceController