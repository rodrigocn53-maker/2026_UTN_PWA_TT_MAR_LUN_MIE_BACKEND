import ServerError from "../helpers/error.helper.js"
import WorkspaceMember from "../models/workspaceMember.model.js"
import WorkspaceModel from "../models/workspace.model.js"
import ChannelModel from "../models/channel.model.js"
import ChannelMessages from "../models/channelMessages.model.js"

class SearchService {
    async globalSearch(user_id, query) {
        if (!query || query.trim() === '') {
            return { workspaces: [], channels: [], messages: [] }
        }

        // 1. Encontrar todos los workspaces de los que el usuario es miembro
        const memberships = await WorkspaceMember.find({ fk_id_user: user_id }).select('fk_id_workspace')
        const user_workspace_ids = memberships.map(m => m.fk_id_workspace)

        // Usamos regex para hacer una búsqueda insensible a mayúsculas
        const searchRegex = new RegExp(query, 'i')

        // 2. Buscar Workspaces que coincidan con la búsqueda
        const workspaces = await WorkspaceModel.find({
            _id: { $in: user_workspace_ids },
            $or: [
                { title: searchRegex },
                { description: searchRegex }
            ]
        }).select('_id title description')

        const matching_workspace_ids = workspaces.map(w => w._id);

        // 3. Buscar Canales:
        // - Que el nombre coincida con la búsqueda OR
        // - Que pertenezcan a un Workspace que coincida con la búsqueda
        const channels = await ChannelModel.find({
            fk_id_workspace: { $in: user_workspace_ids },
            is_active: { $ne: false },
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { fk_id_workspace: { $in: matching_workspace_ids } }
            ]
        }).select('_id name fk_id_workspace').populate('fk_id_workspace', 'title')

        // 4. Buscar Mensajes
        // Necesitamos encontrar los miembros del usuario para asociarlos,
        // pero la búsqueda de mensajes se hace sobre el texto del mensaje en canales de los workspaces del usuario.
        // Primero, obtener todos los canales válidos del usuario:
        const valid_channels = await ChannelModel.find({
            fk_id_workspace: { $in: user_workspace_ids },
            is_active: { $ne: false }
        }).select('_id fk_id_workspace').populate('fk_id_workspace', 'title')
        
        const valid_channel_ids = valid_channels.map(c => c._id)

        const messages = await ChannelMessages.find({
            fk_id_channel: { $in: valid_channel_ids },
            content: searchRegex
        })
        .populate({
            path: 'fk_id_channel',
            select: 'name fk_id_workspace',
            populate: { path: 'fk_id_workspace', select: 'title' }
        })
        .populate({
            path: 'fk_id_member',
            populate: { path: 'fk_id_user', select: 'name' }
        })
        .sort({ created_at: -1 })
        .limit(20) // Limitamos a 20 mensajes para no saturar

        return {
            workspaces,
            channels: channels.map(c => ({
                id: c._id,
                name: c.name,
                workspace_id: c.fk_id_workspace._id,
                workspace_title: c.fk_id_workspace.title
            })),
            messages: messages.map(m => ({
                id: m._id,
                content: m.content,
                created_at: m.created_at,
                channel_id: m.fk_id_channel._id,
                channel_name: m.fk_id_channel.name,
                workspace_id: m.fk_id_channel.fk_id_workspace._id,
                workspace_title: m.fk_id_channel.fk_id_workspace.title,
                sender_name: m.fk_id_member?.fk_id_user?.name || 'Usuario'
            }))
        }
    }
}

const searchService = new SearchService()
export default searchService
