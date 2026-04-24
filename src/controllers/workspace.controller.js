import workspaceMemberRepository from "../repository/member.repository.js"
import memberWorkspaceService from "../services/memberWorkspace.service.js"
import workspaceService from "../services/workspace.service.js"

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
        const { email, role } = req.body
        try {
            await memberWorkspaceService.inviteMember(workspace_id, email, role)
            res.status(201).json({
                ok: true,
                status: 201,
                message: 'Invitación enviada con éxito'
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
}

const workspaceController = new WorkspaceController()

export default workspaceController