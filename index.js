const { ApolloServer, gql } = require('apollo-server');
const resolvers = require('./db/resolvers');
const typeDefs = require('./db/schema');
const MongoConnection = require('./config/db');

// Server
const server = new ApolloServer({
    typeDefs,
    resolvers
});

// Init DB connection
MongoConnection();

// Start server
server.listen().then( ({ url }) => {
    console.log(`server running on ${url}`);
});