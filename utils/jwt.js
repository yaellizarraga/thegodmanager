const jwt = require('jsonwebtoken');

const createToken = async (userId, secret, expiration) => {
    return jwt.sign({ userId }, secret, { expiresIn: expiration });
};

module.exports = {
    createToken,
};