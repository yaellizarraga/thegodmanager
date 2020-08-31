const User = require('../models/User');
const Product = require('../models/Product');
const { encryptPassword, decryptPassword } = require('../utils/hash');
const { userExist } = require('../utils/auth');
const { createToken, verifyToken } = require('../utils/jwt');

const resolvers = {
  Query: {
    getUser: async (_, { token }) => verifyToken(token, process.env.JWT_SECRET),
    getProducts: async () => {
      try {
        const products = await Product.find({});
        return products;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return null;
      }
    },
    getProduct: async (_, { id }) => {
      try {
        const product = await Product.findById(id);
        if (!product) {
          throw new Error('Product does not exist');
        }
        return product;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return null;
      }
    },
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
      if (!await decryptPassword(user.password, password)) {
        throw new Error('Incorrect password');
      }

      return {
        token: createToken(user.id, process.env.JWT_SECRET, '24h'),
      };
    },
    newProduct: async (_, { input }) => {
      try {
        const product = new Product(input);
        const result = await product.save();
        return result;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return false;
      }
    },
  },
};

module.exports = resolvers;
