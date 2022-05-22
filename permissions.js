const { shield } = require("graphql-shield");
const { isAuthenticated } = require("./rules");

const permissions = shield(
  {
    Query: {
      me: isAuthenticated,
    },
  },
  {
    allowExternalErrors: true,
    debug: true,
    fallbackError: async (error, parent, args, context, info) => {
      return error;
    },
  }
);

module.exports = permissions;
