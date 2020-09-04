/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server');

const context = ({ req }) => {
  const token = req.headers.authorization || '';
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);

      return {
        user,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      return null;
    }
  } else {
    throw new AuthenticationError('You must be logged in to run querys');
  }
};

module.exports = {
  context,
};
