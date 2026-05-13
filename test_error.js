import ServerError from "./src/helpers/error.helper.js";
console.log("Testing ServerError...");
try {
    throw new ServerError("Email o contraseña incorrectos", 401);
} catch (e) {
    console.log("String error:", e.message, e.status);
}

try {
    throw new ServerError({ message: "Objeto de error", status: 403, ok: false });
} catch (e) {
    console.log("Object error:", e.message, e.status);
}
