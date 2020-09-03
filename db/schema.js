const { gql } = require('apollo-server');

const typeDefs = gql`
    type User {
        id: ID
        name: String
        lastName: String
        email: String
        created: String
    }

    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        created: String
    }

    type Client {
        id: ID
        name: String
        lastName: String
        company: String
        email: String
        phone: String
        created: String
        salesman: ID
    }

    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }

    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
    }

    input AuthInfo {
        email: String!
        password: String!
    }

    input ClientInput {
        name: String!
        lastName: String!
        company: String!
        email: String!
        phone: String
    }

    type Token {
        token: String
    }

    type Query {
        # Users
        getUser(token: String!): User

        # Products
        getProducts: [Product]
        getProduct(id: ID!): Product

        # Client
        getClients: [Client]
        getClientsBySalesman: Client
        getClient(id: ID!): Client
    }

    type Mutation {
        # Users
        newUser(input: UserInput): User
        authUser(input: AuthInfo): Token

        # Products
        newProduct(input: ProductInput!) : Product
        editProduct(id: ID!, input: ProductInput!): Product
        deleteProduct(id: ID!): Boolean

        # Clients
        newClient(input: ClientInput!): Client
        editClient(id: ID!, input: ClientInput!): Client
        deleteClient(id: ID!): Boolean
    }
`;

module.exports = typeDefs;
