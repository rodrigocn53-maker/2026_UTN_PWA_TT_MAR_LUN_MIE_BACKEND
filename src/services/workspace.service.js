import ServerError from "../helpers/error.helper.js"
import workspaceRepository from "../repository/workspace.repository.js"
import memberWorkspaceService from "./memberWorkspace.service.js"
import channelService from "./channel.service.js"

class WorkspaceService {
    async create(title, description, url_image, user_id) {
        if (!title || !url_image) {
            throw new ServerError('El título es obligatorio', 400) //Description es opcional
        }
        const workspace_created = await workspaceRepository.create(title, description, url_image)
        await memberWorkspaceService.create(
            user_id, 
            workspace_created._id, 
            'owner'
        )
        
        // Crear canales por defecto
        await channelService.create(workspace_created._id, 'general', 'Canal general del workspace')
        await channelService.create(workspace_created._id, 'random', 'Canal para temas variados')

        return workspace_created
    }
     async getOne(workspace_id) {
        if (!workspace_id) {
            throw new ServerError("Debe proporcionar un id", 400)
        }

        // Si la Id no es valida
      /*   if (!isValidObjectId(workspace_id)) {
            throw new ServerError("Id de espacio de trabajo invalida", 400)
        }
 */
        try {
            // Agregar la lista de miembros
            const workspace = await workspaceRepository.getById(workspace_id)

            // Si el espacio no existe
            if (!workspace) {
                throw new ServerError("El espacio de trabajo no existe", 404)
            }

            return workspace
        } catch (error) {
            throw error
        }
    }
    async update(workspace_id, title, description, url_image) {
        if (!workspace_id) {
            throw new ServerError("Debe proporcionar un id", 400)
        }
        const updated = await workspaceRepository.updateById(workspace_id, { title, description, url_image })
        return updated
    }

    async delete(workspace_id) {
        if (!workspace_id) {
            throw new ServerError("Debe proporcionar un id", 400)
        }
        
        // Cascading deletes
        const WorkspaceMember = (await import('../models/workspaceMember.model.js')).default;
        const ChannelModel = (await import('../models/channel.model.js')).default;
        
        await WorkspaceMember.deleteMany({ fk_id_workspace: workspace_id });
        await ChannelModel.deleteMany({ fk_id_workspace: workspace_id });

        await workspaceRepository.deleteById(workspace_id)
        return true
    }
}
const workspaceService = new WorkspaceService()
export default workspaceService