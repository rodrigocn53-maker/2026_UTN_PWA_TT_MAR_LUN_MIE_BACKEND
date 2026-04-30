import JWTHelper from '../helpers/jwt.helper.js';

/**
 * Middleware to extract user information from JWT if present,
 * but does NOT block the request if the token is missing or invalid.
 * Useful for public routes that can benefit from user context (like Support).
 */
const extractUserMiddleware = (req, res, next) => {
    try {
        let auth_token = req.cookies?.auth_token;

        if (!auth_token && req.headers.authorization) {
            auth_token = req.headers.authorization.split(' ')[1];
        }

        if (auth_token) {
            const payload = JWTHelper.verify(auth_token);
            req.user = payload;
        }
    } catch (error) {
        // We don't throw error here because this is optional.
        // We just log it for debugging if it's not an expiration/invalid token error.
        console.log('[ExtractUserMiddleware] No valid token found, proceeding as guest.');
    }
    next();
};

export default extractUserMiddleware;
