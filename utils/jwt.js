const jwt = require('jsonwebtoken');

const createToken = async (userId, secret, expiration) => jwt.sign({ userId }, secret, { expiresIn: expiration });

const verifyToken = async (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = {
  createToken,
  verifyToken,
};
