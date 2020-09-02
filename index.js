const { ApolloServer } = require('apollo-server');
const resolvers = require('./db/resolvers');
const typeDefs = require('./db/schema');
const { context } = require('./db/context');
const MongoConnection = require('./config/db');

// Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

// Init DB connection
MongoConnection();

// Start server
server.listen().then(({ url }) => {
  // eslint-disable-next-line no-console
  console.log(`server running on ${url}`);
});
