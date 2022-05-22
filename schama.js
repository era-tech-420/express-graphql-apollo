const { ApolloServer, gql, ValidationError } = require("apollo-server-express");
const User = require("./models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./exception/handler");

const typeDefs = gql`
  type User {
    id: ID
    name: String
    email: String
  }

  type AuthPayload {
    user: User
    token: String
  }

  type Query {
    hello: String
    me: User
  }

  type Mutation {
    signup(
      name: String!
      email: String!
      password: String!
      confirm_password: String!
    ): User
    login(email: String!, password: String!): AuthPayload
  }
`;

const resolvers = {
  Query: {
    hello: () => "hello world",
    me: (parents, args, context, info) => {
      return context.auth_user;
    },
  },
  Mutation: {
    signup: async (parent, args, context, info) => {
      const { name, email, password } = args;
      const already_exsist = await User.findOne({ email });
      if (already_exsist) {
        throw new ValidationError("Email already exists");
      }
      const hashed_password = await argon2.hash(password);
      const user = await User.create({
        name,
        email,
        password: hashed_password,
      });
      return user;
    },
    login: async (parent, args, context, info) => {
      const { email, password } = args;
      const user = await User.findOne({ email });

      if (!user) {
        throw new ValidationError("Invalid email given");
      }

      if (!(await argon2.verify(user.password, password))) {
        throw new ValidationError("Invalid password given!");
      }
      const token = jwt.sign(
        { data: { userId: user._id, email } },
        "my super secret",
        { expiresIn: "1h" }
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
