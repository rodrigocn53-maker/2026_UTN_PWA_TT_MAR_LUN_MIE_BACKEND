Invitar un miembro
POST /api/workspace/:workspace_id/member/invite
body ejemplo: {
    email: email del invitado,
    role: 'user' | 'admin'
}

Que sea una invitacion (que el usuario pueda aceptar o declinar) y en caso de aceptar pueda entrar

Crean el miembro como invitado (acceptInvitation: 'pending', 'accepted', 'rejected') y enviamos un mail con 2 links (cada uno con su token y la accion aceptar o rechazar) al usuario invitado.

Si el usuario da click en el link que tiene el token enviara un get al backend donde se pasara el acceptInvitation a 'accepted' o 'rejected'.

EJEMPLO de endpoint para tomar decision
GET /api/workspace/:workspace_id/member/?token=ey
body: {
    email: email del invitado,
    role: 'user' | 'admin'
}

dentro del token estara el action con 'accepted' o 'rejected'
Revisar si el miembro esta en pendiente, si no esta pendiente NO DEJAR QUE LA ACCION CAMBIE AL MIEMBRO, debido a que este ya tomo una decision.

OBSERVACIONES:
    - El modelo de miembros ahora tendra la propiedad acceptInvitation
    - Aun no hay frontend, todo es backend
    - Usar las envs cuando correspondan (por ejemplo la URL_BACKEND)