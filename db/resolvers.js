const User = require('../models/User');
const { encryptPassword, decryptPassword } = require('../utils/hash');
const { userExist } = require('../utils/auth');
const { createToken, verifyToken } = require('../utils/jwt');

const resolvers = {
  Query: {
    getUser: async (_, { token }) => verifyToken(token),
  },
  Mutation: {
    newUser: async (_, { input }) => {
      const { email, password } = input;

      // Validate if user is already registered
      const exist = await User.findOne({ email });
      if (exist) {
        throw new Error('The user is already registered');
      }

      // eslint-disable-next-line no-param-reassign
      input.password = await encryptPassword(password);

      try {
        const user = new User(input);
        user.save();
        return user;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        return null;
      }
    },
    authUser: async (_, { input }) => {
      const { email, password } = input;
      const user = await userExist(email);

      if (!user) {
        throw new Error('User not exist');
      }
      // eslint-disable-next-line no-console
      console.log(user);
      if (!await decryptPassword(user.password, password)) {
        throw new Error('Incorrect password');
      }

      return {
        token: createToken(user.id, process.env.JWT_SECRET, '24h'),
      };
    },
  },
};

module.exports = resolvers;
