const { ValidationError, ForbiddenError } = require("apollo-server-express");
const { UnauthorizedError } = require("./exception/handler");
module.exports = (err) => {
  if (err.originalError instanceof ValidationError) {
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
  console.log(err);
  return {
    code: 500,
    status: "INTERNAL_SERVER_ERROR",
    message: "internal server error",
  };
};
