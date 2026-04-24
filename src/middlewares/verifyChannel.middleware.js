import { isValidObjectId } from "mongoose"


import ServerError from "../helpers/error.helper.js"
import channelRepository from "../repository/channel.repository.js"

async function verifyChannelMiddleware(req, res, next) {
    const { channel_id } = req.params
    const workspace_id = req.workspace._id
    
    // Si no se proporciona el canal
    if (!channel_id) {
        throw new ServerError('No se proporcionó el canal', 400)
    }
    // Si no es una id valida
    if(!isValidObjectId(channel_id)) {
        throw new ServerError("Id de canal invalida", 400)
    }

    try {
        const channel = await channelRepository.getById(channel_id)
        if (!channel) {
            throw new ServerError('El canal no existe', 404)
        }
        
        if (channel.channel_workspace_id.toString() !== workspace_id.toString()) {
            throw new ServerError('El canal no pertenece al espacio de trabajo', 403)
        }
        
        req.channel = channel
        next()
    } catch (error) {
        if (error instanceof ServerError) {
            return res.status(error.status).json(
                {
                    ok: false,
                    status: error.status,
                    message: error.message
                }
            )
        }
        else {
            console.error('Error inesperado en el registro', error)
            return res.status(500).json(
                {
                    ok: false,
                    status: 500,
                    message: "Internal server error"
                }
            )
        }
    }
}

export default verifyChannelMiddleware