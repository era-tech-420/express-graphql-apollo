const { shield, and } = require("graphql-shield");
const {
  isAuthenticated,
  signupValidation,
  loginValidation,
  updateProfileValidation,
} = require("./rules");
const objectHash = require("object-hash");
const { ulid } = require("ulid");

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
    hashFunction: ({ parent, args }) => {
      try {
        return objectHash(args);
      } catch (error) {
        if (error.message === 'Unknown object type "promise"') {
          // ObjectHash can't handle promises so return a unique string as the hash instead
          return ulid();
        } else {
          throw error;
        }
      }
    },
  }
);

module.exports = permissions;
