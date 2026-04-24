import channelService from "../services/channel.service.js"

class ChannelController {
    async create(req, res, next) {
        try {
            const workspace = req.workspace
            const { name, description } = req.body

            const channel = await channelService.create(workspace._id, name, description)

            res.status(201).json(
                {
                    ok: true,
                    status: 201,
                    message: 'Canal creado exitosamente',
                    data: {
                        channel
                    }
                }
            )
        } catch (error) {
            next(error)
        }
    }

    async getAll(req, res, next) {
        try {
            const workspace = req.workspace
            const channels = await channelService.getAll(workspace._id)

            res.status(200).json(
                {
                    ok: true,
                    status: 200,
                    message: 'Canales obtenidos exitosamente',
                    data: {
                        channels
                    }
                }
            )
        } catch (error) {
            next(error)
        }
    }

    async getById(req, res, next) {
        try {
            const { workspace, channel } = req
            const channel_found = await channelService.getById(workspace._id, channel.channel_id)

            res.status(200).json(
                {
                    ok: true,
                    status: 200,
                    message: 'Canal obtenido exitosamente',
                    data: {
                        channel: channel_found
                    }
                }
            )
        } catch (error) {
            next(error)
        }
    }

    async softDelete(req, res, next) {
        try {
            const { workspace, channel } = req

            const channel_found = await channelService.softDelete(workspace._id, channel.channel_id)

            res.status(200).json(
                {
                    ok: true,
                    status: 200,
                    message: 'Canal eliminado exitosamente',
                    data: {
                        channel: channel_found
                    }
                }
            )
        } catch (error) {
            next(error)
        }
    }

    async delete(req, res, next) {
        try {
            const { workspace, channel } = req

            const channel_found = await channelService.delete(workspace._id, channel.channel_id)

            res.status(200).json(
                {
                    ok: true,
                    status: 200,
                    message: 'Canal eliminado exitosamente',
                    data: {
                        channel: channel_found
                    }
                }
            )
        } catch (error) {
            next(error)
        }
    }
}

const channelController = new ChannelController()
export default channelController