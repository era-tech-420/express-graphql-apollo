const { rule } = require("graphql-shield");
const { UnauthorizedError } = require("./exception/handler");

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  if (!ctx.auth_user) {
    return new UnauthorizedError();
  }
  return true;
});

module.exports = {
  isAuthenticated,
};
