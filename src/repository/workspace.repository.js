/* 
Crear la class WorkspaceRepository con los sig metodos:
- create()
- daleteById()
- getById()
- updateById()
*/

import WorkspaceModel from "../models/workspace.model.js";
import ServerError from "../helpers/error.helper.js";

class WorkspaceRepository {
    async create(title, description, url_image, active) {
        try {
            const workspace = await WorkspaceModel.create({
                title: title,
                description: description,
                url_image,
                active
            })
            return workspace
        } catch (error) {
            if (error.code === 11000) {
                throw new ServerError("El título de este espacio de trabajo ya está en uso", 400);
            }
            throw new ServerError("Error al crear el espacio de trabajo en la base de datos", 500);
        }
    };

    async deleteById(workspace_id) {
        try {
            await WorkspaceModel.findByIdAndDelete(workspace_id);
        } catch (error) {
            throw new ServerError("Error al eliminar el espacio de trabajo", 500);
        }
    };

    async getById(workspace_id) {
        try {
            return await WorkspaceModel.findById(workspace_id)
        } catch (error) {
            throw new ServerError("Error al obtener el espacio de trabajo", 500);
        }
    };

    async updateById(workspace_id, new_workspace_props) {
        try {
            const new_workspace = await WorkspaceModel.findByIdAndUpdate(workspace_id, new_workspace_props, { new: true })
            return new_workspace;
        } catch (error) {
            if (error.code === 11000) {
                throw new ServerError("El título proporcionado ya está en uso", 400);
            }
            throw new ServerError("Error al actualizar el espacio de trabajo", 500);
        }
    };
}
const workspaceRepository = new WorkspaceRepository()
export default workspaceRepository;


/* 
Para manejar asincronia en JS existen 3 formas comunes:

Con callbacks:
Cuando la funcion acabe la accion se ejecutara la callback
Cuando termines de pensar decime tu idea

sincronizarPDF(
    (result) => {
        console.log('El pdf sincronizado es ' , result)
        enviarMailNotificacion(
            (result) => {
                console.log("mail enviado")
            }
        )
    }
)

Con async / await (La mas recomendada):
Cuando la la promesa se resuelve el resto de codigo que sigue al await se ejecuta
Aguardare a que termines de pensar y ahi dime tu idea

const result = await sincronizarPDF()
console.log('El pdf sincronizado es ' , result)
const mail_result = await enviarMailNotificacion()
console.log("mail enviado")


Con then y catch:
Las promesas tienen acceso al metodo .then y .catch. .then se ejecutara cuando la promesa se resuelva, a su vez then recibe una callback que es la accion que tendra que ejecutar cuando termine de resolverse la promesa. El catch se activa si hay un error en la promesa y tambien recibe una callback que se ejecutara si hay error.

sincronizarPDF()
.then(
    (result) => {
        console.log('El pdf sincronizado es ' , result)
        enviarMailNotificacion().then(
            (result) => {
                console.log("mail enviado")
            }
        )
    }
)

*/

