
import ServerError from "../helpers/error.helper.js"
import channelRepository from "../repository/channel.repository.js"


class ChannelService {
    async create(workspace_id, name, description) {
        if(!workspace_id || !name) {
            throw new ServerError("Faltan campos obligatorios", 400)
        }
        const channel = await channelRepository.create(workspace_id, name, description)
        return channel
    }

    async getAll(workspace_id) {
        if(!workspace_id) {
            throw new ServerError("Faltan campos obligatorios", 400)
        }
        const channels = await channelRepository.getAll(workspace_id)
        return channels
    }

    async getById(workspace_id, channel_id) {
        if(!workspace_id || !channel_id) {
            throw new ServerError("Faltan campos obligatorios", 400)
        }
        
        const channel = await channelRepository.getById(channel_id)
        return channel
    }

    async softDelete(workspace_id, channel_id) {
        if(!workspace_id || !channel_id) {
            throw new ServerError("Faltan campos obligatorios", 400)
        }

        
        const channel = await channelRepository.softDelete(channel_id)
        return channel
    }

    async delete(workspace_id, channel_id) {

        if(!workspace_id || !channel_id) {
            throw new ServerError("Faltan campos obligatorios", 400)
        }

        const channel = await channelRepository.delete( channel_id)
        return channel
    }
}

const channelService = new ChannelService()

export default channelService