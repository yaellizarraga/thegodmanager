/* eslint-disable no-empty-pattern */
const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Order = require('../models/Order');
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
    getClientsBySalesman: async (_, {}, ctx) => {
      try {
        const clients = await Client.find({ salesman: ctx.user.id.toString() });

        return clients;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return null;
      }
    },
    getClient: async (_, { id }, ctx) => {
      const client = await Client.findById(id);

      if (!client) {
        throw new Error('Client does not exist');
      }

      if (client.salesman.toString() !== ctx.user.id) {
        throw new Error('Forbidden');
      }

      return client;
    },
    getOrders: async () => {
      try {
        const orders = await Order.find({});

        return orders;
      } catch (error) {
        throw new Error(error);
      }
    },
    getOrdersBySalesman: async (_, {}, ctx) => {
      try {
        const orders = await Order.find({ salesman: ctx.user.id });

        return orders;
      } catch (error) {
        throw new Error(error);
      }
    },
    getOrderById: async (_, { id }, ctx) => {
      // Check if order exist
      const order = await Order.findById(id);

      if (!order) {
        throw new Error('Order does not exist');
      }

      if (order.salesman.toString() !== ctx.user.id) {
        throw new Error('Forbidden');
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
    editClient: async (_, { id, input }, ctx) => {
      let client = await Client.findById(id);

      if (!client) {
        throw new Error('Client does not exist');
      }

      if (client.salesman.toString() !== ctx.user.id) {
        throw new Error('Forbidden');
      }

      try {
        client = await Client.findOneAndUpdate({ _id: id }, input, { new: true });

        return client;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return false;
      }
    },
    deleteClient: async (_, { id }, ctx) => {
      let client = await Client.findById(id);

      if (!client) {
        throw new Error('Client does not exist');
      }

      if (client.salesman.toString() !== ctx.user.id) {
        throw new Error('Forbidden');
      }

      try {
        client = await Client.findOneAndDelete({ _id: id });

        return true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return false;
      }
    },
    newOrder: async (_, { input }, ctx) => {
      const { client } = input;

      // Verify if client exist
      const clientExist = await Client.findById(client);

      if (!clientExist) {
        throw new Error('Client does not exist');
      }

      // Verify if client is a salesman's client
      if (clientExist.salesman.toString() !== ctx.user.id) {
        throw new Error('Forbidden');
      }

      // Check if stock is available
      if (input.order) {
        // eslint-disable-next-line no-restricted-syntax
        for await (const product of input.order) {
          const { id } = product;

          const productInfo = await Product.findById(id);

          if (product.quantity > productInfo.stock) {
            throw new Error(`Product: ${product.name} stock is not enough`);
          } else {
            productInfo.stock -= product.quantity;

            await productInfo.save();
          }
        }
      }

      // Create order
      const newOrder = new Order(input);

      // Assing order to a salesman
      newOrder.salesman = ctx.user.id;

      // Save the order in database
      const result = await newOrder.save();
      return result;
    },
    editOrder: async (_, { id, input }, ctx) => {
      const orderExist = await Order.findById(id);

      if (!orderExist) {
        throw new Error('Order does not exist');
      }

      const clientExist = await Client.findById(input.client);

      if (!clientExist) {
        throw new Error('Client does not exist');
      }

      // Verify if client is a salesman's client
      if (clientExist.salesman.toString() !== ctx.user.id) {
        throw new Error('Forbidden');
      }

      // Check if stock is available
      // eslint-disable-next-line no-restricted-syntax
      for await (const product of input.order) {
        const productInfo = await Product.findById(product.id);

        if (product.quantity > productInfo.stock) {
          throw new Error(`Product: ${product.name} stock is not enough`);
        } else {
          productInfo.stock -= product.quantity;

          await productInfo.save();
        }
      }

      const result = await Order.findOneAndUpdate({ _id: id }, input, { new: true });
      return result;
    },
  },
};

module.exports = resolvers;
