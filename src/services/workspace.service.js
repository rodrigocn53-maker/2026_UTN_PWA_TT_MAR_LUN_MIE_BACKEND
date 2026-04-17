import workspaceRepository from "../repository/workspace.repository"


class WorkspaceService{
    async createWorkspace({title, description, url_image}) {
        if(!title || !description || !url_image){
            throw new ServerError("Title, description and url_image are required", 400)
        }
        const workspace_created = await workspaceRepository.create(title, description, url_image)
        return workspace_created
    }
}

const workspaceService = new WorkspaceService()

export default workspaceService