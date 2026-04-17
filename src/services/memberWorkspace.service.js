import ServerError from "../helpers/error.helper.js"
import workspaceMemberRepository from "../repository/member.repository.js"

class MemberWorkspaceService{
    async getWorkspace(user_id){
        const workspaceList = await workspaceMemberRepository.getWorkspaceListByUserId(user_id)
        return workspaceList
    }
    async create({user_id, workspace_id, role}){
        //Verificar que no alla un membresia para ese usuario
        const result = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user_id)

        if(result.length > 0){
            throw new ServerError("Ya existe una membresia para ese usuario", 400)
        }

        await workspaceMemberRepository.create(user_id, workspace_id, role)
        return new_workspace
    }
}

const memberWorkspaceService = new MemberWorkspaceService()
export default memberWorkspaceService
