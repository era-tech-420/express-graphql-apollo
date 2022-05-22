const { rule, inputRule } = require("graphql-shield");
const { UnauthorizedError } = require("./exception/handler");

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  if (!ctx.auth_user) {
    return new UnauthorizedError();
  }
  return true;
});

const signupValidation = inputRule()(
  (yup) => {
    return yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().min(4).required(),
      confirm_password: yup.string().oneOf([yup.ref("password")]),
    });
  },
  {
    abortEarly: true,
  }
);

const loginValidation = inputRule()(
  (yup) => {
    return yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().min(4).required(),
    });
  },
  {
    abortEarly: true,
  }
);

module.exports = {
  isAuthenticated,
  signupValidation,
  loginValidation,
};
