const { rule, inputRule } = require("graphql-shield");
const { UnauthorizedError } = require("./exception/handler");
const { checkfileSize } = require("./helpers");

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
    const MAX_FILE_SIZE = 3 * 1000 * 1000; // 2(mb) * 1000 (kbs of 1 mb) * 1000 (bytes of 1kb)
    return yup.object().shape({
      name: yup.string().nullable(true),
      profile_picture: yup
        .mixed()
        .test({
          message: "Please provide only the image",
          test: async (file, context) => {
            let isValid = true;
            if (file) {
              const { filename } = await file;
              isValid = ["png", "jpg", "jpeg"].includes(
                filename.split(".").pop()
              );
            }
            return isValid;
          },
        })
        .test({
          message: "Size of image must be less than 2mb",
          test: async (file, context) => {
            let isValid = true;
            if (file) {
              const fileObj = await file;
              try {
                await checkfileSize(fileObj, MAX_FILE_SIZE);
              } catch (error) {
                if (error === false) {
                  isValid = false;
                }
              }
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
