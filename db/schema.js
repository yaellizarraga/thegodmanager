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
        id: ID,
        name: String
        stock: Int
        price: Float
        created: String
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

    type Token {
        token: String
    }

    type Query {
        # Users
        getUser(token: String!): User

        # Products
        getProducts: [Product]
        getProduct(id: ID!): Product
    }

    type Mutation {
        # Users
        newUser(input: UserInput): User
        authUser(input: AuthInfo): Token

        # Products
        newProduct(input: ProductInput) : Product
    }
`;

module.exports = typeDefs;
