const { ApolloServer, gql } = require("apollo-server-express");
const User = require("./models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const typeDefs = gql`
  type User {
    id: ID
    name: String
    email: String
  }

  type Query {
    hello: String
    users: [User]
  }

  type AuthPayload {
    user: User
    token: String
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): User
    login(email: String!, password: String!): AuthPayload
  }
`;

const resolvers = {
  Query: {
    hello: () => "hello world",
    users: async () => {
      const users = await User.find({});
      return users;
    },
  },
  Mutation: {
    signup: async (parent, args, context, info) => {
      const { name, email, password } = args;
      const hashed_password = await argon2.hash("password");
      const user = await User.create({
        name: name,
        email: email,
        password: hashed_password,
      });
      return user;
    },
    login: async (parent, args, context, info) => {
      const { email, password } = args;
      const user = await User.findOne({ email });
      if (!user) {
        throw Error("Invalid Email given!");
      }

      if (!(await argon2.verify(user.password, password))) {
        throw Error("Password is incorrect!");
      }
      const token = jwt.sign(
        {
          data: {
            userId: user._id,
            email: user.email,
          },
        },
        "secret",
        { expiresIn: 60 * 60 }
      );
      return {
        user,
        token,
      };
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
