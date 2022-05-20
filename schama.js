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

  type AuthPayload {
    user: User
    token: String
  }

  type Query {
    hello: String
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): User
    login(email: String!, password: String!): AuthPayload
  }
`;

const resolvers = {
  Query: {
    hello: () => "hello world",
  },
  Mutation: {
    signup: async (parent, args, context, info) => {
      try {
        const { name, email, password } = args;
        const already_exsist = await User.findOne({ email });
        if (already_exsist) {
          throw Error("Email already exists");
        }
        const hashed_password = await argon2.hash(password);
        const user = await User.create({
          name,
          email,
          password: hashed_password,
        });
        return user;
      } catch (error) {
        console.log(error);
      }
    },
    login: async (parent, args, context, info) => {
      try {
        const { email, password } = args;
        const user = await User.findOne({ email });
        if (!user) {
          throw Error("Invalid email given");
        }
        if (!(await argon2.verify(user.password, password))) {
          throw Error("Invalid password given!");
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
      } catch (error) {
        console.log(error);
      }
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
