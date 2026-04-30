import jwt from 'jsonwebtoken'
import ENVIRONMENT from '../config/environment.config.js'

/**
 * Utility to handle JWT operations in a centralized and scalable way.
 */
class JWTHelper {
    /**
     * Signs a payload to create an access token
     * @param {Object} payload 
     * @param {String|Number} expiresIn 
     * @param {String} secret - Optional custom secret
     * @returns {String} token
     */
    static sign(payload, expiresIn = '7d', secret = ENVIRONMENT.JWT_SECRET_KEY) {
        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Verifies a token and returns the decoded payload
     * @param {String} token 
     * @param {String} secret - Optional custom secret (useful for password resets)
     * @returns {Object} payload
     */
    static verify(token, secret = ENVIRONMENT.JWT_SECRET_KEY) {
        return jwt.verify(token, secret);
    }

    /**
     * Decodes a token without verifying it (useful for error handling)
     * @param {String} token 
     * @returns {Object} payload
     */
    static decode(token) {
        return jwt.decode(token);
    }

    /**
     * Standard payload structure for consistent authentication across the app
     */
    static createAuthPayload(user) {
        return {
            id: user._id,
            email: user.email,
            name: user.name,
            username: user.username,
            tag: user.tag,
            created_at: user.created_at
        };
    }
}

export default JWTHelper;
