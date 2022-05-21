const { ApolloError } = require("apollo-server-errors");

class UnauthorizedError extends ApolloError {
  constructor(message = "unauthorized") {
    super(message, "GRAPHQL_UNAUTHORIZED");

    Object.defineProperty(this, "name", { value: "UnauthorizedError" });
  }
}

module.exports = {
  UnauthorizedError,
};
