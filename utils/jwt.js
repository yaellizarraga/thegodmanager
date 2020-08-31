const jwt = require('jsonwebtoken');

const createToken = async (id, secret, expiration) => jwt.sign({ id }, secret, { expiresIn: expiration });

const verifyToken = async (token, secret) => jwt.verify(token, secret);

module.exports = {
  createToken,
  verifyToken,
};
