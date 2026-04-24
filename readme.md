## API De manejo de espacios de trabajo

Es una aplicacion que esta pensada para gestionar la mensajeria interna de equipos de trabajo. 
Cada espacio de trabajo tiene miembros, los miembros van a tener permisos sobre los espacios de trabajo.
Cada espacio de trabajo tiene canales, donde se hablaran y se podra enviar mensajes de ciertos temas.

Los espacios de trabajo tienen permisos de administrador y miembro.

## AUTH

POST /api/auth/login
Maneja el login de los usuarios, devuelve el token de autentificacion
body: {
    email,
    password
}

Response: {
    ok: true,
    status: 200,
    message: 'Usuario logueado con exito',
    data: {
        auth_token
    }
}