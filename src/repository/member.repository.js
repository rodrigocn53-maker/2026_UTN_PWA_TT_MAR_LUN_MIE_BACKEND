/* 
WorkspaceMemberRepository
    - create (fk_id_user, fk_id_workspace, role)
    - updateRole(id_member, role)
    - delete(id_member)
    - getMemberList(workspace_id) //Obtiene lista de miembros relacionados a ese espacio de trabajo
*/


import WorkspaceMember from "../models/workspaceMember.model.js"
import ServerError from "../helpers/error.helper.js"

class WorkspaceMemberRepository {
    async create(fk_id_workspace, fk_id_user, role) {
        try {
            return await WorkspaceMember.create({
                fk_id_workspace,
                fk_id_user,
                role
            })
        } catch (error) {
            if (error.code === 11000) {
                throw new ServerError("El usuario ya es miembro de este espacio de trabajo", 400);
            }
            throw new ServerError("Error al registrar el miembro en la base de datos", 500);
        }
    }

    async deleteById(workspace_member_id) {
        try {
            await WorkspaceMember.findByIdAndDelete(workspace_member_id)
        } catch (error) {
            throw new ServerError("Error al eliminar el miembro", 500);
        }
    }

    async getById(workspace_member_id) {
        try {
            return await WorkspaceMember.findById(workspace_member_id)
        } catch (error) {
            throw new ServerError("Error al obtener el miembro", 500);
        }
    }

    async updateRoleById(member_id, role) {
        try {
            const new_workspace_member = await WorkspaceMember.findByIdAndUpdate(
                member_id,
                { role: role },
                { new: true }
            )
            return new_workspace_member
        } catch (error) {
            throw new ServerError("Error al actualizar el rol del miembro", 500);
        }
    }

    async updateInvitationStatus(member_id, status) {
        try {
            const updated_member = await WorkspaceMember.findByIdAndUpdate(
                member_id,
                { acceptInvitation: status },
                { new: true }
            )
            return updated_member
        } catch (error) {
            throw new ServerError("Error al actualizar el estado de la invitación", 500);
        }
    }

    async getAll() {
        try {
            return await WorkspaceMember.find()
        } catch (error) {
            throw new ServerError("Error al obtener la lista de miembros", 500);
        }
    }

    async getMemberList(fk_id_workspace) {
        try {
            const members = await WorkspaceMember.find({ fk_id_workspace: fk_id_workspace })
                .populate('fk_id_user', 'name email')

            const members_mapped = members.map(
                (member) => {
                    return {
                        member_id: member._id,
                        member_role: member.role,
                        member_created_at: member.created_at,

                        user_id: member.fk_id_user._id,
                        user_name: member.fk_id_user.name,
                        user_email: member.fk_id_user.email
                    }
                }
            )
            return members_mapped
        } catch (error) {
            throw new ServerError("Error al obtener la lista de miembros del espacio", 500);
        }
    }

    async getWorkspaceListByUserId(user_id) {
        try {
            const members = await WorkspaceMember.find({ fk_id_user: user_id })
                .populate('fk_id_workspace')

            const members_mapped = members.map(
                (member) => {
                    return {
                        member_id: member._id,
                        member_role: member.role,
                        member_created_at: member.created_at,

                        workspace_id: member.fk_id_workspace._id,
                        workspace_title: member.fk_id_workspace.title,
                        workspace_description: member.fk_id_workspace.description
                    }
                }
            )

            return members_mapped
        } catch (error) {
            throw new ServerError("Error al obtener la lista de espacios de trabajo del usuario", 500);
        }
    }

    async getByWorkspaceAndUserId(workspace_id, user_id) {
        try {
            return await WorkspaceMember.findOne({ fk_id_workspace: workspace_id, fk_id_user: user_id })
        } catch (error) {
            throw new ServerError("Error al buscar el miembro en el espacio", 500);
        }
    }

    async isMemberPartOfWorkspaceById(user_id, workspace_id) {
        try {
            const member = await WorkspaceMember.findOne({
                fk_id_user: user_id,
                fk_id_workspace: workspace_id,
            });
            return member;
        } catch (error) {
            throw new ServerError("Error al verificar la pertenencia al espacio", 500);
        }
    }
}
const workspaceMemberRepository = new WorkspaceMemberRepository()
export default workspaceMemberRepository