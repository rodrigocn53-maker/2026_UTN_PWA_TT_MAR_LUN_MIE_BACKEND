import { isValidObjectId } from "mongoose"
import ServerError from "../helpers/error.helper.js"
import workspaceRepository from "../repository/workspace.repository.js"


async function verifyWorkspaceMiddleware(req, res, next) {
    const { workspace_id } = req.params
    
    // Si no se proporciona el espacio de trabajo
    if (!workspace_id) {
        throw new ServerError('No se proporcionó el espacio de trabajo', 400)
    }
    // Si no es una id valida
    if(!isValidObjectId(workspace_id)) {
        throw new ServerError("Id de espacio de trabajo invalida", 400)
    }

    try {
        const workspace = await workspaceRepository.getById(workspace_id)
        if (!workspace) {
            throw new ServerError('El espacio de trabajo no existe', 404)
        }
        
        req.workspace = workspace
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

export default verifyWorkspaceMiddleware