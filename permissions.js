const { shield, and } = require("graphql-shield");
const objectHash = require("object-hash");
const { ulid } = require("ulid");
const {
  isAuthenticated,
  signupValidation,
  loginValidation,
  updateProfileValidation,
} = require("./rules");

const permissions = shield(
  {
    Query: {
      me: isAuthenticated,
    },
    Mutation: {
      signup: signupValidation,
      login: loginValidation,
      updateProfile: and(isAuthenticated, updateProfileValidation),
    },
  },
  {
    allowExternalErrors: true,
    debug: true,
    fallbackError: async (error, parent, args, context, info) => {
      return error;
    },
    hashFunction: ({ error, parent, args }) => {
      try {
        return objectHash(args);
      } catch (error) {
        if (error.message == 'Unknown object type "promise"') {
          return ulid();
        }
      }
    },
  }
);

module.exports = permissions;
