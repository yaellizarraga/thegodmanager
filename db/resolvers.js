const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
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
    getClients: async () => {
      try {
        const clients = await Client.find({});
        return clients;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return null;
      }
    },
    // eslint-disable-next-line no-empty-pattern
    getClient: async (_, {}, ctx) => {
      try {
        const clients = await Client.find({ salesman: ctx.user.id.toString() });
        return clients;
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
      const exist = await userExist(email);
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
    editProduct: async (_, { id, input }) => {
      let product = await Product.findById(id);

      if (!product) {
        throw new Error('Product does not exist');
      }

      product = await Product.findOneAndUpdate({ _id: id }, input, { new: true });

      return product;
    },
    deleteProduct: async (_, { id }) => {
      try {
        const product = await Product.findById(id);

        if (!product) {
          throw new Error('Product does not exist');
        }

        await Product.findOneAndDelete({ _id: id });
        return true;
      } catch (error) {
        return false;
      }
    },
    newClient: async (_, { input }, ctx) => {
      const { email } = input;
      try {
        const client = await Client.findOne({ email });

        if (client) {
          throw new Error('Client is registered');
        }

        const newClient = new Client(input);
        newClient.salesman = ctx.user.id;
        const result = newClient.save();

        return result;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return null;
      }
    },
  },
};

module.exports = resolvers;
