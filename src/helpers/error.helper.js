class ServerError extends Error{
    constructor(message, status){
        if (typeof message === 'object') {
            super(message.message)
            this.status = message.status || 500
        } else {
            super(message)
            this.status = status || 500
        }
    }
}


export default ServerError