

function errorHandlerMiddleware (error, request, response, next){
    console.error("Error capturado por middleware:", error)

    if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            ok: false,
            status: 401,
            message: "Token inválido"
        });
    }

    if (error.name === 'TokenExpiredError') {
        return response.status(401).json({
            ok: false,
            status: 401,
            message: "Token expirado"
        });
    }

    if(error.status){
        return response.status(error.status).json({ 
            ok: false, 
            status: error.status, 
            message: error.message 
        });
    }

    return response.status(500).json({ 
        ok: false, 
        status: 500, 
        message: "Internal server error" 
    });
}

export default errorHandlerMiddleware