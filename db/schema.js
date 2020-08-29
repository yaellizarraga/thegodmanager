const { gql } = require('apollo-server');

const typeDefs = gql`
    type User {
        id: ID
        name: String
        lastName: String
        email: String
        created: String
    }

    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }

    input AuthInfo {
        email: String!
        password: String!
    }

    type Token {
        token: String
    }

    type Query {
        getUser(token: String!): User
    }

    type Mutation {
        newUser(input: UserInput): User
        authUser(input: AuthInfo): Token
    }
`;

module.exports = typeDefs;
