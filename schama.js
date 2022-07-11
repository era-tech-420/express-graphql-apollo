const { ApolloServer, gql, ValidationError } = require("apollo-server-express");
const User = require("./models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./exception/handler");
const GraphQLUpload = require("graphql-upload/GraphQLUpload.js");
const {
  getRandomString,
  storeFS,
  uploadFile,
  deleteFile,
} = require("./helpers");

const typeDefs = gql`
  scalar Upload

  type File {
    encryptedName: String!
    mimetype: String!
    encoding: String!
    filename: String!
  }

  type User {
    id: ID
    name: String
    email: String
    profile_picture: String
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
    updateProfile(name: String, file: Upload): User
  }
`;

const resolvers = {
  Upload: GraphQLUpload,
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
        { expiresIn: "15h" }
      );
      return {
        user,
        token,
      };
    },
    updateProfile: async (parent, args, context, info) => {
      let user = context.auth_user;

      let data_to_update = {};
      if (args.name) {
        data_to_update["name"] = args.name;
      }

      if (args.file) {
        const { fileLocation } = await uploadFile(args, "file");
        fileLocation && deleteFile(user.profile_picture);
        data_to_update["profile_picture"] = fileLocation;
      }

      user = Object.keys(data_to_update).length
        ? await User.findByIdAndUpdate(user._id, data_to_update, { new: true })
        : user;

      return user;
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
