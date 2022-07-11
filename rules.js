const { rule, inputRule } = require("graphql-shield");
const { UnauthorizedError } = require("./exception/handler");
const { checkFileSize } = require("./helpers");

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

const updateProfileValidation = inputRule()(
  (yup) => {
    const MAX_FILE_SIZE = 5 * 1000 * 1000; // mb * (kb of 1mb) * (bytes of 1 kb)
    return yup.object().shape({
      name: yup.string().nullable(),
      file: yup
        .mixed()
        .nullable(true)
        .test({
          message: "Please provide a supported file type",
          test: async (file, context) => {
            const { filename } = await file;
            const isValid = ["png", "jpg"].includes(filename.split(".").pop());
            return isValid;
          },
        })
        .test({
          message: `File too big, can't exceed 5MB`,
          test: async (file) => {
            let isValid = true;
            const { createReadStream } = await file;
            try {
              await checkFileSize(createReadStream, MAX_FILE_SIZE);
            } catch (e) {
              if (typeof e === "number") isValid = false;
            }

            return isValid;
          },
        }),
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
  updateProfileValidation,
};
