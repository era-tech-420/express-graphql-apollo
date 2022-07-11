const {
  ValidationError,
  ForbiddenError,
  UserInputError,
} = require("apollo-server-express");
const { GraphQLError } = require("graphql");
const { UnauthorizedError } = require("./exception/handler");
module.exports = (err) => {
  if (
    err.originalError instanceof ValidationError ||
    err instanceof UserInputError
  ) {
    return {
      code: 400,
      status: err.extensions.code,
      message: err.message,
    };
  }

  if (err.originalError instanceof UnauthorizedError) {
    return {
      code: 401,
      status: err.extensions.code,
      message: err.message,
    };
  }

  if (err.originalError instanceof ForbiddenError) {
    return {
      code: 403,
      status: err.extensions.code,
      message: err.message,
    };
  }

  if (
    err instanceof GraphQLError &&
    err.extensions.exception.name == "ValidationError"
  ) {
    return {
      code: 400,
      status: err.extensions.exception.name,
      message: err.message,
    };
  }

  return {
    code: 500,
    status: "INTERNAL_SERVER_ERROR",
    message: "internal server error",
    error: err,
  };
};
